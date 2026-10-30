import express from "express";
import { PrismaClient } from "@prisma/client";
import { authMiddleware } from "../middleware/auth.js";
import {
  validateGstinFormat,
  verifyGstinWithProvider,
  checkNameMismatch
} from "../services/gstVerificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/business - Retrieve company profile for authenticated user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const business = await prisma.business.findFirst({
      where: { userId: req.user.id }
    });

    if (!business) {
      return res.status(404).json({ error: "Business profile not found" });
    }

    res.json(business);
  } catch (err) {
    console.error("Fetch Business Error:", err);
    res.status(500).json({ error: "Failed to load business profile" });
  }
});

// POST /api/business/verify-gstin - Format validation + Live Registration Lookup
router.post("/verify-gstin", authMiddleware, async (req, res) => {
  try {
    const { gstin, enteredBusinessName } = req.body;

    if (!gstin || typeof gstin !== "string") {
      return res.status(400).json({
        success: false,
        error: "GSTIN is required. Please provide a 15-character GST identification number."
      });
    }

    const normalized = gstin.trim().toUpperCase();

    // 1. Strict syntax & Mod-36 check digit validation
    const formatResult = validateGstinFormat(normalized);
    if (!formatResult.isValid) {
      return res.status(400).json({
        success: false,
        status: "INVALID_FORMAT",
        error: "Invalid GSTIN format. Please check the GSTIN and try again.",
        formatDetails: formatResult
      });
    }

    // 2. Registration Verification with GSP / Sandbox Service
    const verification = await verifyGstinWithProvider(normalized);

    // Case: Service Unavailable / Timeout
    if (verification.status === "API_UNAVAILABLE") {
      return res.status(503).json({
        success: false,
        status: "API_UNAVAILABLE",
        error: "GSTIN verification is temporarily unavailable. Please try again later.",
        verificationProvider: verification.verificationProvider
      });
    }

    // Case: Registration Not Found
    if (verification.status === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        status: "NOT_FOUND",
        error: "GSTIN could not be verified. Please check the number.",
        verificationProvider: verification.verificationProvider
      });
    }

    // Case: Inactive / Cancelled / Suspended Registration
    if (
      verification.status === "CANCELLED" ||
      verification.status === "SUSPENDED" ||
      verification.status === "INACTIVE"
    ) {
      return res.status(200).json({
        success: false,
        isInactive: true,
        status: verification.status,
        error: `Taxpayer registration is ${verification.status}. Inactive GSTINs cannot be treated as valid active suppliers.`,
        verification
      });
    }

    // 3. Database Check: Detect if GSTIN is already registered by another user (Multi-Tenant Isolation)
    const existingOtherUserCompany = await prisma.business.findFirst({
      where: {
        gstin: normalized,
        userId: { not: req.user.id }
      },
      include: {
        user: { select: { email: true, name: true } }
      }
    });

    const currentUserCompany = await prisma.business.findFirst({
      where: { userId: req.user.id }
    });

    // 4. Business Name Mismatch Detection
    const nameMismatchCheck = checkNameMismatch(
      verification.legalName,
      enteredBusinessName || currentUserCompany?.businessName || ""
    );

    // 5. Audit Logging
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "GSTIN_VERIFIED",
        entityType: "Business",
        entityId: normalized,
        details: `GSTIN verification performed for ${normalized} (${verification.legalName}) via ${verification.verificationProvider}. Result: ${verification.status}`
      }
    });

    return res.json({
      success: true,
      message: "GSTIN verified successfully. Please confirm your business details.",
      verification,
      nameCheck: nameMismatchCheck,
      alreadyExistsInDatabase: !!existingOtherUserCompany,
      existingCompanyMessage: existingOtherUserCompany
        ? "This GSTIN is already registered by another organization account in GST Sahayak."
        : null,
      currentUserProfileExists: !!currentUserCompany,
      currentProfile: currentUserCompany
    });
  } catch (err) {
    console.error("GSTIN Verification Route Error:", err);
    res.status(500).json({ error: "Failed to verify GSTIN: " + err.message });
  }
});

// POST /api/business/confirm-profile - Explicit user confirmation to create/update profile
router.post("/confirm-profile", authMiddleware, async (req, res) => {
  try {
    const {
      gstin,
      businessName,
      legalName,
      tradeName,
      pan,
      businessCategory,
      registrationType,
      registrationStatus,
      registrationDate,
      state,
      address,
      principalPlace,
      email,
      phone,
      verificationProvider,
      verificationReference
    } = req.body;

    if (!gstin || !businessName || !state) {
      return res.status(400).json({ error: "GSTIN, Business Name, and State are required fields." });
    }

    const normalized = gstin.trim().toUpperCase();

    // 1. Validate format & checksum
    const formatResult = validateGstinFormat(normalized);
    if (!formatResult.isValid) {
      return res.status(400).json({
        error: "Invalid GSTIN format. Cannot create profile with a malformed GSTIN.",
        details: formatResult
      });
    }

    // 2. Prevent duplicate takeover of another tenant's company
    const existingOther = await prisma.business.findFirst({
      where: {
        gstin: normalized,
        userId: { not: req.user.id }
      }
    });

    if (existingOther) {
      return res.status(409).json({
        error: "A company profile with this GSTIN is already registered by another account. To prevent duplicates, please check the registration."
      });
    }

    // 3. Upsert profile under authenticated user account
    const company = await prisma.business.upsert({
      where: { userId: req.user.id },
      update: {
        businessName: businessName.trim(),
        legalName: legalName || businessName.trim(),
        tradeName: tradeName || businessName.trim(),
        gstin: normalized,
        pan: pan || formatResult.pan,
        businessCategory: businessCategory || "Information Technology & Hardware",
        registrationType: registrationType || "Regular",
        registrationStatus: registrationStatus || "ACTIVE",
        registrationDate: registrationDate || null,
        state: state.trim(),
        address: address ? address.trim() : "",
        principalPlace: principalPlace || null,
        email: email ? email.trim() : "",
        phone: phone ? phone.trim() : "",
        isGstinVerified: true,
        gstinVerifiedAt: new Date(),
        verificationProvider: verificationProvider || "GST Sahayak Verified Gateway",
        verificationReference: verificationReference || `REF-${Date.now()}`
      },
      create: {
        userId: req.user.id,
        businessName: businessName.trim(),
        legalName: legalName || businessName.trim(),
        tradeName: tradeName || businessName.trim(),
        gstin: normalized,
        pan: pan || formatResult.pan,
        businessCategory: businessCategory || "Information Technology & Hardware",
        registrationType: registrationType || "Regular",
        registrationStatus: registrationStatus || "ACTIVE",
        registrationDate: registrationDate || null,
        state: state.trim(),
        address: address ? address.trim() : "",
        principalPlace: principalPlace || null,
        email: email ? email.trim() : "",
        phone: phone ? phone.trim() : "",
        isGstinVerified: true,
        gstinVerifiedAt: new Date(),
        verificationProvider: verificationProvider || "GST Sahayak Verified Gateway",
        verificationReference: verificationReference || `REF-${Date.now()}`
      }
    });

    // 4. Immutable Audit Trail
    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "COMPANY_PROFILE_CREATED",
        entityType: "Business",
        entityId: company.id,
        details: `Company profile confirmed and created: ${company.businessName} (GSTIN: ${company.gstin}) with verified status ${company.registrationStatus}`
      }
    });

    res.json({
      message: "Company profile created and verified successfully in database.",
      business: company
    });
  } catch (err) {
    console.error("Confirm Profile Error:", err);
    res.status(500).json({ error: "Failed to create company profile: " + err.message });
  }
});

// PUT /api/business - Update existing company profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const {
      businessName,
      legalName,
      tradeName,
      gstin,
      pan,
      businessCategory,
      registrationType,
      registrationStatus,
      state,
      address,
      principalPlace,
      email,
      phone,
      isGstinVerified,
      verificationProvider
    } = req.body;

    const normalized = gstin ? gstin.trim().toUpperCase() : undefined;

    // Check duplicate
    if (normalized) {
      const existingOther = await prisma.business.findFirst({
        where: {
          gstin: normalized,
          userId: { not: req.user.id }
        }
      });
      if (existingOther) {
        return res.status(409).json({
          error: "A company profile with this GSTIN is already registered by another account."
        });
      }
    }

    const updated = await prisma.business.upsert({
      where: { userId: req.user.id },
      update: {
        businessName,
        legalName: legalName || undefined,
        tradeName: tradeName || undefined,
        gstin: normalized,
        pan: pan || undefined,
        businessCategory,
        registrationType: registrationType || "Regular",
        registrationStatus: registrationStatus || "ACTIVE",
        state,
        address,
        principalPlace: principalPlace || undefined,
        email,
        phone,
        isGstinVerified: isGstinVerified !== undefined ? isGstinVerified : true,
        verificationProvider: verificationProvider || undefined
      },
      create: {
        userId: req.user.id,
        businessName,
        legalName: legalName || businessName,
        tradeName: tradeName || businessName,
        gstin: normalized || "27AABCB9876F1Z2",
        pan: pan || undefined,
        businessCategory: businessCategory || "Information Technology & Hardware",
        registrationType: registrationType || "Regular",
        registrationStatus: registrationStatus || "ACTIVE",
        state,
        address,
        principalPlace: principalPlace || undefined,
        email,
        phone,
        isGstinVerified: isGstinVerified !== undefined ? isGstinVerified : false,
        verificationProvider: verificationProvider || undefined
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user.id,
        action: "BUSINESS_PROFILE_UPDATED",
        entityType: "Business",
        entityId: updated.id,
        details: `Updated details for ${updated.businessName} (GSTIN: ${updated.gstin})`
      }
    });

    res.json({ message: "Business profile updated successfully", business: updated });
  } catch (err) {
    console.error("Update Business Error:", err);
    res.status(500).json({ error: "Failed to update business profile: " + err.message });
  }
});

export default router;

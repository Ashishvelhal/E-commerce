import { Request, Response } from 'express';
import { Setting } from '../models/Setting';
import { AuthRequest } from '../types';

/**
 * @desc    Get public / store settings
 * @route   GET /api/settings
 * @access  Public
 */
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = await Setting.create({
        key: 'global_settings',
        storeName: 'Rasin Arts Luxury 3D Studio',
        supportEmail: 'support@rasinarts.com',
        whatsappNumber: '+91 98765 43210',
        whatsappCheckoutEnabled: true,
        whatsappCustomMessage: 'Hello Rasin Arts Studio! I would like to place an order for the following items:',
        freeShippingThreshold: 999,
        currencySymbol: 'INR (₹)',
        customizerEnabled: true,
        enabledCustomizerProducts: [
          'keychain-initial',
          'nameplate-rect',
          'thali-puja',
          'frame-photo',
          'clock-round-12',
        ],
        maintenanceMode: false,
      });
    }

    if (!settings.whatsappNumber) {
      settings.whatsappNumber = '+91 98765 43210';
    }
    if (settings.whatsappCheckoutEnabled === undefined) {
      settings.whatsappCheckoutEnabled = true;
    }
    if (!settings.whatsappCustomMessage) {
      settings.whatsappCustomMessage = 'Hello Rasin Arts Studio! I would like to place an order for the following items:';
    }
    if (!settings.gstin) {
      settings.gstin = '27AABCR1234F1Z5';
    }
    if (!settings.studioAddress) {
      settings.studioAddress = 'Studio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050, India';
    }
    if (!settings.invoicePrefix) {
      settings.invoicePrefix = 'RA-';
    }
    if (!settings.brandTitle) {
      settings.brandTitle = 'Rasin Arts';
    }
    if (!settings.brandSubtitle) {
      settings.brandSubtitle = 'Luxury 3D Studio';
    }
    if (!settings.logoIcon) {
      settings.logoIcon = 'Palette';
    }
    if (settings.logoImageUrl === undefined) {
      settings.logoImageUrl = '';
    }
    if (!settings.logoBlobShape) {
      settings.logoBlobShape = 'resin-blob';
    }
    if (!settings.logoGradient) {
      settings.logoGradient = 'amber-rose';
    }

    if (!settings.salesEmail) {
      settings.salesEmail = 'sales@rasinarts.com';
    }
    if (!settings.billingEmail) {
      settings.billingEmail = 'invoicing@rasinarts.com';
    }
    if (!settings.orderNotificationEmail) {
      settings.orderNotificationEmail = 'orders@rasinarts.com';
    }
    if (!settings.customMailboxes || settings.customMailboxes.length === 0) {
      settings.customMailboxes = [
        {
          id: 'mbx-1',
          email: 'support@rasinarts.com',
          department: 'Customer Care & Helpdesk',
          label: 'Support Desk',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-2',
          email: 'custom@rasinarts.com',
          department: '3D Customizer & Bespoke Projects',
          label: 'Artisan Studio',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-3',
          email: 'corporate@rasinarts.com',
          department: 'B2B Bulk Gifting & Wedding Favors',
          label: 'Corporate Desk',
          isActive: true,
          showOnStorefront: true,
        },
        {
          id: 'mbx-4',
          email: 'accounts@rasinarts.com',
          department: 'GST Billing & Invoices',
          label: 'Finance & Invoicing',
          isActive: true,
          showOnStorefront: false,
        },
      ];
    }
    if (!settings.emailTemplates) {
      settings.emailTemplates = {
        orderConfirmationSubject: '🎉 Order Confirmation & Studio Invoice - [OrderNumber] | Rasin Arts',
        orderConfirmationGreeting: 'Thank you for choosing Rasin Arts Luxury Studio! Your bespoke handcrafted resin art piece is now scheduled in our curing queue.',
        orderConfirmationFooter: 'Our master artisans carefully pour each resin layer, de-bubble under vacuum, and cure for 48 hours for flawless optical clarity.',
        customInquirySubject: '✨ Bespoke 3D Resin Customization Inquiry Received | Rasin Arts',
        customInquiryGreeting: 'We have received your custom 3D design specifications. Our head artisan will review your dimensions, colors, and foil inlay requirements.',
        bulkQuoteSubject: '🎁 Luxury B2B & Bulk Gifting Quotation - Rasin Arts Studio',
        bulkQuoteGreeting: 'Thank you for considering Rasin Arts for your corporate event or wedding celebration. Below is your detailed quotation breakdown.',
        emailSignature: 'Warm Artisanal Regards,\nThe Master Artisans & Design Studio Team\nRasin Arts Luxury 3D Studio\nStudio #402, Artisans Galleria, Linking Road, Mumbai, MH 400050\nWhatsApp: +91 98765 43210 | www.rasinarts.com',
      };
    }
    if (!settings.smtpConfig) {
      settings.smtpConfig = {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        user: 'support@rasinarts.com',
        pass: '',
        senderName: 'Rasin Arts Luxury 3D Studio',
        senderEmail: 'support@rasinarts.com',
        enabled: false,
      };
    }

    // Ensure enabledCustomizerProducts exists if loaded from an older document
    if (!settings.enabledCustomizerProducts || settings.enabledCustomizerProducts.length === 0) {
      settings.enabledCustomizerProducts = [
        'keychain-initial',
        'nameplate-rect',
        'thali-puja',
        'frame-photo',
        'clock-round-12',
      ];
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve settings',
      error: error.message,
    });
  }
};

/**
 * @desc    Update store settings
 * @route   PUT /api/settings
 * @access  Private/Admin
 */
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      storeName,
      supportEmail,
      salesEmail,
      billingEmail,
      orderNotificationEmail,
      customMailboxes,
      emailTemplates,
      smtpConfig,
      whatsappNumber,
      whatsappCheckoutEnabled,
      whatsappCustomMessage,
      freeShippingThreshold,
      currencySymbol,
      customizerEnabled,
      enabledCustomizerProducts,
      maintenanceMode,
      gstin,
      studioAddress,
      invoicePrefix,
      brandTitle,
      brandSubtitle,
      logoIcon,
      logoImageUrl,
      logoBlobShape,
      logoGradient,
      navbarIconStyle,
      navbarIconAnimation,
      navbarCustomIcons,
    } = req.body;

    let settings = await Setting.findOne({ key: 'global_settings' });
    if (!settings) {
      settings = new Setting({ key: 'global_settings' });
    }

    if (storeName !== undefined) settings.storeName = storeName;
    if (supportEmail !== undefined) settings.supportEmail = supportEmail;
    if (salesEmail !== undefined) settings.salesEmail = salesEmail;
    if (billingEmail !== undefined) settings.billingEmail = billingEmail;
    if (orderNotificationEmail !== undefined) settings.orderNotificationEmail = orderNotificationEmail;
    if (customMailboxes !== undefined && Array.isArray(customMailboxes)) {
      settings.customMailboxes = customMailboxes;
    }
    if (emailTemplates !== undefined) {
      settings.emailTemplates = {
        ...settings.emailTemplates,
        ...emailTemplates,
      };
    }
    if (smtpConfig !== undefined) {
      settings.smtpConfig = {
        ...settings.smtpConfig,
        ...smtpConfig,
      };
    }
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber;
    if (whatsappCheckoutEnabled !== undefined) settings.whatsappCheckoutEnabled = Boolean(whatsappCheckoutEnabled);
    if (whatsappCustomMessage !== undefined) settings.whatsappCustomMessage = whatsappCustomMessage;
    if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = Number(freeShippingThreshold);
    if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
    if (customizerEnabled !== undefined) settings.customizerEnabled = Boolean(customizerEnabled);
    if (enabledCustomizerProducts !== undefined && Array.isArray(enabledCustomizerProducts)) {
      settings.enabledCustomizerProducts = enabledCustomizerProducts;
    }
    if (maintenanceMode !== undefined) settings.maintenanceMode = Boolean(maintenanceMode);
    if (gstin !== undefined) settings.gstin = gstin;
    if (studioAddress !== undefined) settings.studioAddress = studioAddress;
    if (invoicePrefix !== undefined) settings.invoicePrefix = invoicePrefix;
    if (brandTitle !== undefined) settings.brandTitle = brandTitle;
    if (brandSubtitle !== undefined) settings.brandSubtitle = brandSubtitle;
    if (logoIcon !== undefined) settings.logoIcon = logoIcon;
    if (logoImageUrl !== undefined) settings.logoImageUrl = logoImageUrl;
    if (logoBlobShape !== undefined) settings.logoBlobShape = logoBlobShape;
    if (logoGradient !== undefined) settings.logoGradient = logoGradient;
    if (navbarIconStyle !== undefined) settings.navbarIconStyle = navbarIconStyle;
    if (navbarIconAnimation !== undefined) settings.navbarIconAnimation = navbarIconAnimation;
    if (navbarCustomIcons !== undefined) settings.navbarCustomIcons = navbarCustomIcons;

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Store settings updated successfully',
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

/**
 * @desc    Trigger database re-seeding with authentic resin arts data
 * @route   POST /api/settings/reseed
 * @access  Private/Admin
 */
export const triggerReseed = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { seedDatabase } = await import('../utils/seeder');
    await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database has been successfully seeded with 100% handcrafted Resin Arts data!',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message,
    });
  }
};

export type Language = 'en' | 'am';

export const translations = {
  en: {
    nav: {
      shop: 'Shop',
      prescriptions: 'Prescriptions',
      checkout: 'Checkout',
      account: 'My Account',
      signIn: 'Sign in',
      signOut: 'Sign out',
      language: 'EN | አማ',
    },
    hero: {
      title: 'Your Trusted Pharmacy,',
      titleHighlight: 'Powered by AI',
      subtitle: 'Fast Delivery Nationwide.',
      cta: 'Shop Medications',
      description: 'Search 12,000+ medications, upload prescriptions securely, and get expert guidance from licensed pharmacists — all in one place.',
    },
    products: {
      allProducts: 'All Products',
      category: 'Shop by Category',
      searchPlaceholder: 'Search medications, brands, or symptoms…',
      dosage: 'Dosage/Strength',
      quantity: 'Quantity/Pack Size',
      otc: 'OTC',
      rx: 'Rx Required',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      lowStock: 'Low Stock',
    },
    checkout: {
      title: 'A Checkout You Can Trust',
      subtitle: 'Walk through every step — from cart to confirmation — in a transparent, secure flow.',
      cart: 'Your Cart',
      items: 'Items',
      shipping: 'Shipping Address',
      payment: 'Payment Method',
      confirm: 'Order Confirmed',
      total: 'Total',
      subtotal: 'Subtotal',
      tax: 'Tax (8%)',
      delivery: 'Delivery',
      proceedPayment: 'Place Order',
      cartEmpty: 'Your cart is empty. Add products to get started.',
      uploadRx: 'Upload Prescription',
      rxRequired: 'Please upload a valid prescription to proceed with Rx items.',
      prescriptionUploaded: 'Prescription uploaded successfully',
      continueCheckout: 'Continue',
    },
    footer: {
      regulated: 'Regulated by EFDA',
      licensed: 'Licensed Pharmacy',
      hipaa: 'HIPAA Compliant',
      secure: 'Secure Prescription Upload',
      about: 'About Us',
      contact: 'Contact',
      privacy: 'Privacy Policy',
      copyright: 'All rights reserved.',
      operating: 'Operating Hours: Mon-Fri 8AM-6PM EAT',
    },
  },
  am: {
    nav: {
      shop: 'ይግዙ',
      prescriptions: 'የሕክምና ወረቀቶች',
      checkout: 'ግዣ ማጠናቀቂያ',
      account: 'የእኔ ሂሳብ',
      signIn: 'ግባ',
      signOut: 'ወጣ',
      language: 'አማ | EN',
    },
    hero: {
      title: 'የመተማመን ፋርማሲ',
      titleHighlight: 'በ AI የሚሰራ',
      subtitle: 'በተሞክሮ ተሰጥኦ',
      cta: 'መድሃኒቶች ይግዙ',
      description: 'ከ 12,000+ መድሃኒቶች, ደህንነታቸውን ወረቀቶች ይላኩ, እና ከ ሙያ ፋርማሲስቶች ምክር ይቀበሉ — ሁሉም በ አንድ ቦታ።',
    },
    products: {
      allProducts: 'ሁሉም ምርቶች',
      category: 'በዓይነት ይግዙ',
      searchPlaceholder: 'መድሃኒቶች ፈልግ...',
      dosage: 'መጠን/ጥንካሬ',
      quantity: 'ብዛት/ጥቅል ልክ',
      otc: 'OTC',
      rx: 'ወረቀት አስፈላጊ',
      addToCart: 'ወደ ሣጥን ጨምር',
      outOfStock: 'ስቶክ ውጪ',
      inStock: 'ስቶክ ውስጥ',
      lowStock: 'ዝቅተኛ ስቶክ',
    },
    checkout: {
      title: 'ልምታዊ ግዣ ማጠናቀቂያ',
      subtitle: 'በተጠቃሚ ምርጥ ሥዋነት በሁሉም ደረጃዎች ያልፉ።',
      cart: 'የእንስሳዎ ሣጥን',
      items: 'ዕቃዎች',
      shipping: 'ማሰላሰያ አድራሻ',
      payment: 'ክፍያ ዘዴ',
      confirm: 'ትእዛዝ ተረጋግጧል',
      total: 'ጠቅላላ',
      subtotal: 'ንዑስ ጠቅላላ',
      tax: 'ግብር (8%)',
      delivery: 'ተሰጥኦ',
      proceedPayment: 'ትእዛዝ ይስጡ',
      cartEmpty: 'የእንስሳዎ ሣጥን ባዶ ነው።',
      uploadRx: 'ወረቀት ያስቀምጡ',
      rxRequired: 'በRx ዕቃዎች ለመቀጠል ልክ የሆነ ወረቀት ያስቀምጡ።',
      prescriptionUploaded: 'ወረቀት በሳካ ተላኩ',
      continueCheckout: 'ለመቀጠል ይጫኑ',
    },
    footer: {
      regulated: 'በEFDA ተቆጣጠረ',
      licensed: 'ፈቃድ ያለው ፋርማሲ',
      hipaa: 'HIPAA ተገዥ',
      secure: 'ደህንነት ወረቀት ሰቀላ',
      about: 'ስለ እኛ',
      contact: 'ያግኙን',
      privacy: 'ግላዊነት ፖሊሲ',
      copyright: 'ሁሉም መብቶች የተጠበቁ ናቸው።',
      operating: 'ስራ ሰዓትሰ: ሰ-ዓ 8AM-6PM',
    },
  },
};

export function getNestedTranslation(
  obj: any,
  path: string
): string {
  const keys = path.split('.');
  let value: any = obj;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) return path;
  }
  
  return value;
}

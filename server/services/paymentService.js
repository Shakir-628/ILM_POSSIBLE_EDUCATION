import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

/**
 * Create Stripe payment intent
 */
export const createStripePayment = async ({ amount, currency = "usd", metadata = {} }) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured. Please add STRIPE_SECRET_KEY to .env");
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe payment error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Verify Stripe payment
 */
export const verifyStripePayment = async (paymentIntentId) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return {
      success: paymentIntent.status === "succeeded",
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
    };
  } catch (error) {
    console.error("Stripe verification error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create Stripe refund
 */
export const createStripeRefund = async (paymentIntentId, amount = null) => {
  try {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
    });

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
    };
  } catch (error) {
    console.error("Stripe refund error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * PayPal integration placeholder
 * Note: Requires paypal-rest-sdk or @paypal/checkout-server-sdk
 */
export const createPayPalPayment = async ({ amount, description }) => {
  // Placeholder for PayPal integration
  return {
    success: false,
    error: "PayPal integration not configured. Add PayPal SDK and credentials.",
  };
};

export default {
  createStripePayment,
  verifyStripePayment,
  createStripeRefund,
  createPayPalPayment,
};


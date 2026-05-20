const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { auth } = require("../middleware/auth");
const User = require("../models/User");

// POST /api/payments/create-checkout
router.post("/create-checkout", auth, async (req, res) => {
  try {
    const { plan } = req.body;
    const prices = { pro: process.env.STRIPE_PRO_PRICE_ID, studio: process.env.STRIPE_STUDIO_PRICE_ID };
    if (!prices[plan]) return res.status(400).json({ message: "Invalid plan" });

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user.email,
      payment_method_types: ["card"],
      line_items: [{ price: prices[plan], quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.FRONTEND_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      metadata: { userId: req.user._id.toString(), plan },
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/payments/webhook
router.post("/webhook", require("express").raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return res.status(400).send("Webhook signature verification failed");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    await User.findByIdAndUpdate(session.metadata.userId, {
      plan: session.metadata.plan,
      stripeCustomerId: session.customer,
    });
  }

  res.json({ received: true });
});

module.exports = router;

import Subscription from '../models/subscription.js';
import User from '../models/user.js';

// Get user subscription
export const getSubscription = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update subscription (for admin or when user upgrades)
export const updateSubscription = async (req, res) => {
  try {
    const userId = req.userId;
    const { plan, expiresAt, isActive, paymentMethod, transactionId } = req.body;

    let subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Update subscription
    await subscription.update({
      plan: plan || subscription.plan,
      expiresAt: expiresAt || subscription.expiresAt,
      isActive: isActive !== undefined ? isActive : subscription.isActive,
      paymentMethod: paymentMethod || subscription.paymentMethod,
      transactionId: transactionId || subscription.transactionId
    });

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.userId;

    const subscription = await Subscription.findOne({
      where: { userId }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
        hasActiveSubscription: false
      });
    }

    const now = new Date();
    const isExpired = subscription.expiresAt && new Date(subscription.expiresAt) < now;

    res.json({
      success: true,
      data: {
        ...subscription.toJSON(),
        isExpired,
        isValid: subscription.isActive && !isExpired
      }
    });
  } catch (error) {
    console.error('Check subscription status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
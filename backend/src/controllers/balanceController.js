import User from "../models/user.js";

export const getBalance = async (req, res) => {
  try {
    const userId = req.session.userId;

    console.log('🔍 GET BALANCE - Session userId:', userId);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'initialBalance', 'currentBalance', 'currency']
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log('✅ GET BALANCE - Success:', {
      initialBalance: user.initialBalance,
      currentBalance: user.currentBalance,
      currency: user.currency
    });

    res.status(200).json({
      initialBalance: parseFloat(user.initialBalance),
      currentBalance: parseFloat(user.currentBalance),
      currency: user.currency
    });
  } catch (error) {
    console.error("❌ Get balance error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateBalance = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { initialBalance, currency } = req.body;

    console.log('🔄 UPDATE BALANCE REQUEST:');
    console.log('Session userId:', userId);
    console.log('Request body:', req.body);
    console.log('initialBalance:', initialBalance, 'Type:', typeof initialBalance);
    console.log('currency:', currency, 'Type:', typeof currency);

    if (!userId) {
      console.log('❌ Unauthorized: No userId in session');
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Validasi initialBalance
    if (initialBalance === undefined || initialBalance === null) {
      console.log('❌ Invalid balance: missing');
      return res.status(400).json({ message: "Balance amount is required" });
    }

    const balanceValue = parseFloat(initialBalance);
    if (isNaN(balanceValue) || balanceValue < 0) {
      console.log('❌ Invalid balance: NaN or negative');
      return res.status(400).json({ message: "Invalid balance amount" });
    }

    if (!currency || !["USD", "IDR", "CENT"].includes(currency)) {
      console.log('❌ Invalid currency:', currency);
      return res.status(400).json({ message: "Invalid currency" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      console.log('❌ User not found with id:', userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('📝 Before update - User:', {
      initialBalance: user.initialBalance,
      currentBalance: user.currentBalance,
      currency: user.currency
    });

    // Update balance dan currency
    user.initialBalance = balanceValue;
    user.currentBalance = balanceValue;
    user.currency = currency;
    
    await user.save();

    console.log('✅ After update - User:', {
      initialBalance: user.initialBalance,
      currentBalance: user.currentBalance,
      currency: user.currency
    });

    res.status(200).json({
      message: "Balance updated successfully",
      initialBalance: parseFloat(user.initialBalance),
      currentBalance: parseFloat(user.currentBalance),
      currency: user.currency
    });
  } catch (error) {
    console.error("💥 Update balance error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCurrentBalance = async (req, res) => {
  try {
    const userId = req.session.userId;
    const { currentBalance } = req.body;

    console.log('🔄 UPDATE CURRENT BALANCE - userId:', userId, 'currentBalance:', currentBalance);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!currentBalance || currentBalance < 0) {
      return res.status(400).json({ message: "Invalid balance amount" });
    }

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.currentBalance = parseFloat(currentBalance);
    await user.save();

    res.status(200).json({
      message: "Current balance updated successfully",
      currentBalance: parseFloat(user.currentBalance),
      currency: user.currency
    });
  } catch (error) {
    console.error("Update current balance error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
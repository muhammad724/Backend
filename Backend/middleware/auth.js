import jwt from 'jsonwebtoken';

// Protect - Verify JWT token
export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('[AUTH] no token in request headers');
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    // log what we got from token
    console.log(`[AUTH] token decoded userId=${decoded.id} role=${decoded.role}`);

    // if token didn't include role (older tokens), look up user from DB
    if (!req.user.role) {
      try {
        const User = await import('../Model/userModel.js');
        const u = await User.default.findById(decoded.id).select('role');
        if (u) {
          req.user.role = u.role;
          console.log(`[AUTH] populated role from DB: ${req.user.role}`);
        }
      } catch (err) {
        console.log('[AUTH] failed to fetch role from DB', err.message);
      }
    }

    next();
  } catch (error) {
    console.log('[AUTH] token verification failed', error.message);
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

// Authorize - Check user roles (case-insensitive)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // normalize role comparison to lowercase
    const userRole = (req.user.role || '').toLowerCase();
    const allowed = roles.map(r => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      console.log(`[AUTH] forbidden: user role=${req.user.role} allowed=[${allowed.join(',')}]`);
      return res.status(403).json({ message: 'Not authorized for this action' });
    }

    next();
  };
};

// Check Subscription - Verify user subscription level
export const checkSubscription = (requiredPlan) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userSubscription = req.user.subscription || 'free';
    const planLevels = { free: 0, basic: 1, pro: 2, premium: 3 };

    if ((planLevels[userSubscription] || 0) < (planLevels[requiredPlan] || 0)) {
      return res.status(403).json({ 
        message: `This feature requires ${requiredPlan} subscription` 
      });
    }

    next();
  };
};

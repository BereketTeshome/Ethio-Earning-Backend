import jwt from 'jsonwebtoken';

const authenticateUser = (roles) => (req, res, next) => {
  const token = req.cookies.jwt; // Get the token from cookies
  // console.log("token",req.cookies);     
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || !roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;  
    next();  
  });
};
 
export const authenticateAdmin = authenticateUser(['admin']);
export const authenticateInvestor = authenticateUser(['investor']);
export const authenticateEarner = authenticateUser(['earner']);
export const authenticateMultipleRoles = authenticateUser(['admin', 'investor', 'earner']);

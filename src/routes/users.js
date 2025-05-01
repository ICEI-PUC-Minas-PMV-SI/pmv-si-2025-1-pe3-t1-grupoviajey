// User routes
const express = require('express');
const router = express.Router();
const { User } = require('../models');

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] } // Do not return passwords
    });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get a specific user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] } // Do not return password
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// Create a new user (register)
router.post('/', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already in use' });
    }
    
    // Create the user (in a real app, you'd hash the password first)
    const newUser = await User.create({
      username,
      email,
      password, // In production, hash this password
      firstName,
      lastName,
      level: 'beginner'
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser.toJSON();
    return res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, firstName, lastName, preferences } = req.body;
    
    // Find the user
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update the user
    await user.update({
      username,
      email,
      firstName,
      lastName,
      preferences
    });
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = user.toJSON();
    return res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user', error: error.message });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await user.destroy();
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user', error: error.message });
  }
});

module.exports = router;
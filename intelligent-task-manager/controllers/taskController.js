const Task = require('../models/Task');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, predictedCompletionTime, dueDate } = req.body;
    const task = await Task.create({
      title, description, priority, predictedCompletionTime, dueDate, user: req.user._id
    });

    const user = await User.findById(req.user._id);

    // Always send email about new task
    await sendEmail(
      user.email,
      '✅ New Task Assigned',
      `You have a new task: "${title}".`
    );

    // Send email if predictedCompletionTime < 1 hour
    if (predictedCompletionTime < 1) {
      await sendEmail(
        user.email,
        '⚠️ Task Time Alert',
        `Task "${title}" has less than 1 hour predicted time!`
      );
    }

    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    Object.assign(task, req.body); // Update fields
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.user.toString() !== req.user._id.toString())
      return res.status(401).json({ message: 'Not authorized' });

    await task.deleteOne();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

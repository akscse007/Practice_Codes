const Fine = require('../models/Fine');

exports.listFines = async (req, res, next) => {
  try {
    const q = {};
    if (req.query.student) q.student = req.query.student;
    if (req.query.paid) q.paid = req.query.paid === 'true';
    const fines = await Fine.find(q).populate('student borrow');
    res.json(fines);
  } catch (err) { next(err); }
};

exports.confirmPayment = async (req, res, next) => {
  try {
    const fine = await Fine.findById(req.params.id);
    if (!fine) return res.status(404).json({ message: 'Fine not found' });
    fine.paid = true;
    fine.paidAt = new Date();
    fine.receiptId = `R-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
    await fine.save();
    res.json(fine);
  } catch (err) { next(err); }
};

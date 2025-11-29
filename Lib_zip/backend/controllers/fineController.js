exports.listFines = async (req, res, next) => { res.status(200).json([]); };
exports.confirmPayment = async (req, res, next) => { res.status(501).json({ message: 'confirmPayment not implemented' }); };

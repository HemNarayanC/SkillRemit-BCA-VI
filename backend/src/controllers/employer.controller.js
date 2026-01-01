import { Employer } from "../models/index.js";

// Create / Register Employer Profile
const createEmployer = async (req, res) => {
    console.log('Creating employer profile with data:', req.body);
    try {
        const {
            company_name,
            business_type,
            registration_number,
            registered_country,
            address,
            document_type
        } = req.body;

        // Check if user already has employer profile
        const existing = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (existing) {
            return res.status(400).json({ message: 'Employer profile already exists' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'At least one document is required' });
        }

        // Collect all uploaded Cloudinary URLs
        const documents = req.files.map(file => file.path);

        const employer = await Employer.create({
            user_id: req.user.user_id,
            company_name,
            business_type,
            registration_number,
            registered_country,
            address,
            document_type,
            document_urls: documents
        });

        return res.status(201).json({ message: 'Employer profile created', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Get Employer Profile
const getEmployerProfile = async (req, res) => {
    try {
        const employer = await Employer.findOne({
            where: { user_id: req.user.user_id }
        });

        if (!employer) {
            return res.status(404).json({ message: 'Employer profile not found' });
        }

        return res.json(employer);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Update Employer Profile (before verification)
const updateEmployerProfile = async (req, res) => {
    try {
        const employer = await Employer.findOne({ where: { user_id: req.user.user_id } });
        if (!employer) return res.status(404).json({ message: 'Employer profile not found' });
        console.log('Current employer profile:', employer);

        // Only allow update if not verified
        if (employer.verification_status === 'verified') {
            return res.status(403).json({ message: 'Cannot update verified profile' });
        }

        const updatedFields = req.body; // Should validate fields in real scenario
        await employer.update(updatedFields);

        return res.json({ message: 'Employer profile updated', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Admin Verification of Employer
const verifyEmployer = async (req, res) => {
    try {
        const { employer_id } = req.params;
        const { status, note } = req.body; // status = 'verified' or 'rejected'

        const employer = await Employer.findByPk(employer_id);
        if (!employer) return res.status(404).json({ message: 'Employer not found' });

        employer.verification_status = status;
        employer.verified_at = new Date();
        employer.verified_by = req.user.user_id; // Admin user
        employer.verification_note = note;

        await employer.save();

        return res.json({ message: 'Employer verification updated', employer });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

// List all verified employers (public endpoint)
const listVerifiedEmployers = async (req, res) => {
    try {
        const employers = await Employer.findAll({
            where: { verification_status: 'verified' }
        });
        return res.json(employers);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};

export {
    createEmployer,
    getEmployerProfile,
    updateEmployerProfile,
    verifyEmployer,
    listVerifiedEmployers
}

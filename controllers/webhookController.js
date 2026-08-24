const { Webhook } = require('svix');
const User = require('../models/User');

// ============================================================
// @desc    Handle incoming Clerk Webhook events
// @route   POST /api/webhooks/clerk
// @access  Public (verified with Svix signature)
// ============================================================
const handleClerkWebhook = async (req, res) => {
    try {
        const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
        if (!webhookSecret) {
            console.error('CLERK_WEBHOOK_SECRET is not configured in .env');
            return res.status(500).json({ message: 'Webhook secret is not configured' });
        }

        // Svix headers required for verification
        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ message: 'Missing svix verification headers' });
        }

        // Use rawBody buffer if present, otherwise fallback to stringified body
        const payload = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
        const wh = new Webhook(webhookSecret);
        let evt;

        try {
            evt = wh.verify(payload, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature
            });
        } catch (err) {
            console.error('Error verifying Clerk webhook signature:', err.message);
            return res.status(400).json({ message: 'Invalid webhook signature' });
        }

        const eventType = evt.type;
        const data = evt.data;

        console.log(`🔔 Clerk Webhook received: ${eventType}`);

        if (eventType === 'user.created' || eventType === 'user.updated') {
            const clerkId = data.id;
            const primaryEmailId = data.primary_email_address_id;
            const emailObj = (data.email_addresses || []).find(e => e.id === primaryEmailId) || (data.email_addresses || [])[0];
            const email = emailObj ? emailObj.email_address : null;

            const firstName = data.first_name || data.unsafe_metadata?.firstName || '';
            const lastName = data.last_name || data.unsafe_metadata?.lastName || '';
            
            // Extract phone number from standard phone numbers or metadata
            let phone = '';
            if (data.phone_numbers && data.phone_numbers.length > 0) {
                phone = data.phone_numbers[0].phone_number;
            } else if (data.unsafe_metadata?.phone) {
                phone = String(data.unsafe_metadata.phone);
            }

            const imageUrl = data.image_url || '';
            const role = data.public_metadata?.role || 'user';
            const theme = data.unsafe_metadata?.theme || 'dark';

            if (!email) {
                console.warn('Clerk user missing email address:', clerkId);
                return res.status(200).json({ message: 'User skipped: no email' });
            }

            const updateFields = {
                clerkId,
                email: email.toLowerCase().trim(),
                firstName,
                lastName,
                phone,
                imageUrl,
                role,
                theme
            };

            // Upsert user in MongoDB by clerkId or email
            const user = await User.findOneAndUpdate(
                { $or: [{ clerkId }, { email: email.toLowerCase().trim() }] },
                { $set: updateFields },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            console.log(`✅ MongoDB user synced from Clerk (${eventType}): ${user.email} [${user._id}]`);
        } else if (eventType === 'user.deleted') {
            const clerkId = data.id;
            if (clerkId) {
                await User.findOneAndDelete({ clerkId });
                console.log(`🗑️ MongoDB user deleted for Clerk ID: ${clerkId}`);
            }
        }

        return res.status(200).json({ status: 'success', event: eventType });
    } catch (error) {
        console.error('Clerk webhook processing error:', error);
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    handleClerkWebhook
};

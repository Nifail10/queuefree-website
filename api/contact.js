export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: "All fields required" });
    }

    console.log("New Contact Message:", {
        name,
        email,
        message,
    });

    return res.status(200).json({ success: true });
}
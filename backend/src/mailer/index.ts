import nodeMailer from "nodemailer";

const { CREATOR_GMAIL, GOOGLE_PASSWORD } = process.env;

if (!CREATOR_GMAIL || !GOOGLE_PASSWORD) {
  throw new Error("Missing nodemailer env varibles");
}

const user = CREATOR_GMAIL;
const pass = GOOGLE_PASSWORD;

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export const sendEmail = async (
  subject: string,
  receiver: string,
  text: string,
) => {
  const mailOptions = {
    from: user,
    to: receiver,
    subject,
    text,
  };
  await transporter.sendMail(mailOptions);
};

import "dotenv/config";
import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import path from "path";

const fastify = Fastify();

fastify.post('/survey', async (req, reply) => {
  const { name, email, rating, notes, token } = req.body;

  // TODO: Validate expected request body

  // TODO: catch errors from this function and take appropriate action
  const { score } = await verifyRecaptcha({ token, action: "survey" });

  // Determine what to do based on the score for your use-case.
  // For this demo, log the score and send an error message response.
  if (score < 0.5) {
    console.log(`Request failed reCAPTCHA. Score: ${score}`)
    reply.code(422) // Unprocessable entity
    return { success: false, message: "Failed CAPTCHA" };
  }

  // If the score passes, determine what to do with the survey
  // results. This could be writing them to a database or 
  // something else. For this demo, we're going to log the survey
  // responses to the console and return a coupon code.
  console.log(`\
    Score:\t${score}
    Name:\t${name}
    Email:\t${email}
    Rating:\t${rating}
    Notes:\t${notes}
  `);
  return { success: true, coupon: generateCoupon() };
});

const verifyRecaptcha = async ({ token, action }) => {
  const res = await fetch(
    "https://www.google.com/recaptcha/api/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_PRIV_KEY,
        response: token,
      }).toString(),
    }
  );
  
  // Check for HTTP error codes
  if (!res.ok) throw new Error(res.statusText);
  const data = await res.json();

  // Check for reCAPTCHA error codes
  if (!data.success)
    throw new Error(`ReCAPTCHA Errors: ${data["error-codes"].join(", ")}`);

  // Make sure expected action matches action used to generate token
  if (data.action !== action) {
    const msg = 
      `Client action ("${data.action}") did not match expected action of "${action}"`;
    throw new Error(msg)
  }

  // if all checks were successful, return the whole reCAPTCHA 
  // verification object, which includes the `score`.
  return data;
}





// ======== CONFIG =======
fastify.register(fastifyFormbody); // for parsing form data

// serve all static files in `/website/` directory at the `/website/` route prefix
fastify.register(fastifyStatic, {
  root: path.join(path.resolve(), "website"),
  prefix: "/website/"
});

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
});





// ======== UTILS =======
const generateCoupon = (length = 10) => {
  const bag = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return new Array(length)
    .fill(0)
    .map(() => bag.charAt(randRange(0, bag.length)))
    .join('');
}

const randRange = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor((Math.random() * (max - min + 1))) + min
}

const sleep = (ms) => new Promise((res) => { setTimeout(res, ms); })

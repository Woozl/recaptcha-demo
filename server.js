import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import fastifyFormbody from "@fastify/formbody";
import path from "path";

const fastify = Fastify();

// ====== ROUTES ======

// This is our survey response handler
fastify.post('/survey', async (req) => {
  console.log("Received a survey response: ");

  // Validate expected response
  const { name, email, rating, notes } = req.body;
  if (!name)
    return { error: "Missing name" };
  if (!email || !email.includes("@"))
    return { error: "Missing or invalid email"};
  if (!rating)
    return { error: "Missing rating" };
  const parsedRating = parseInt(rating);
  if (parsedRating < 1 || parsedRating > 5)
    return { error: "Rating must be between 1 and 5" };
  
  console.log(`\
    Name:\t${name}
    Email:\t${email}
    Rating:\t${parsedRating} star${parsedRating > 1 ? "s" : ""}
    Notes:\t${notes}\
  `);

  // upon successful verification of completed survey, send a coupon code
  return {
    coupon: generateCoupon()
  }
});



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

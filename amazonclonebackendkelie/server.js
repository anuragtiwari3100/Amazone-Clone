// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const Products = require("./Products");

// const app = express();
// const port = process.env.PORT || 8000;

// app.use(express.json());
// app.use(cors());

// mongoose.connection.on("connected", () => {
//   console.log("Connected to MongoDB");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("Failed to connect to MongoDB", err);
// });

// mongoose.connect("mongodb+srv://anuragtiwarigpj2005:xzLe5VsVuqInCADo@awtproject.b8rc7w5.mongodb.net/ApnaProject", {
//   useNewUrlParser: true,
//   useUnifiedTopology: true, 
// })
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.error("MongoDB Connection Error", err));

// app.get("/", (req, res) => res.status(200).send("Home Page"));



// app.post("/products/add", (req, res) => {
//   const productDetail = req.body;
//   console.log("Product Detail >>>>", productDetail);

//   Products.create(productDetail)
//     .then((data) => {
//       res.status(201).send(data);
//     })
//     .catch((err) => {
//       res.status(500).send(err.message);
//       console.log(err);
//     });
// });





// app.get("/products/get", async (req, res) => {
//   try {
//     const data = await Products.find();
//     res.status(200).send(data);
//   } catch (err) {
//     res.status(500).send(err);
//   }
// });




// app.listen(port, () => console.log("listening on the port", port));



const express = require("express");
const bcrypt = require('bcrypt');
const cors = require("cors");
const Users = require("./Users");
const mongoose = require("mongoose");
const Products = require("./Products");
const Orders = require("./Orders");
const stripe = require("stripe")(
  "sk_test_51P2uwrSHkCdAUzvuoPSnsLIZzLftkjeuZKdy9MbDvXdtjh9a8x4qL7x9XBsBpWt8YTVkmAe5LqEvbC4lj5tQVEt600tjhG7xWj"
);

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB", err);
});

mongoose.connect("mongodb+srv://anuragtiwarigpj2005:xzLe5VsVuqInCADo@awtproject.b8rc7w5.mongodb.net/ApnaProject", {
  useNewUrlParser: true,
  useUnifiedTopology: true, 
})
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.error("MongoDB Connection Error", err));

app.get("/", (req, res) => res.status(200).send("Home Page"));



app.post("/products/add", (req, res) => {
  const productDetail = req.body;
  console.log("Product Detail >>>>", productDetail);

  Products.create(productDetail)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(500).send(err.message);
      console.log(err);
    });
});













// API for SIGNUP

app.post("/auth/signup", async (req, res) => {
  const { email, password, fullName } = req.body;

  const encrypt_password = await bcrypt.hash(password, 10);

  const userDetail = {
    email: email,
    password: encrypt_password,
    fullName: fullName,
  };

  const user_exist = await Users.findOne({ email: email });



  if (user_exist) {
    res.send({ message: "The Email is already in use !" });
  } else {
    try {
      const result = await Users.create(userDetail);
      res.send({ message: "User Created Succesfully" });
    } catch (err) {
      res.status(500).send({ message: err.message });
    }
  }
  


});










// API for LOGIN

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await Users.findOne({ email: email });

  if (userDetail) {
    if (await bcrypt.compare(password, userDetail.password)) {
      res.send(userDetail);
    } else {
      res.send({ error: "invaild Password" });
    }
  } else {
    res.send({ error: "user is not exist" });
  }
});




// API for PAYMENT

app.post("/payment/create", async (req, res) => {
  const total = req.body.amount;
  console.log("Payment Request recieved for the ruppess", total);

  const payment = await stripe.paymentIntents.create({
    amount: total * 100,
    currency: "inr",
  });

  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});



app.get("/products/get", async (req, res) => {
  try {
    const data = await Products.find();
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});




// API TO add ORDER DETAILS

app.post("/orders/add", (req, res) => {
  const products = req.body.basket;
  const price = req.body.price;
  const email = req.body.email;
  const address = req.body.address;

  const orderDetail = {
    products: products,
    price: price,
    address: address,
    email: email,
  };

  Orders.create(orderDetail)
  .then(result => {
    console.log("Order added to database >> ", result);
    // Any additional logic after successfully creating the order
  })
  .catch(err => {
    console.log(err);
    // Handle error appropriately, e.g., send error response
  });

});


app.post("/orders/get", async (req, res) => {
  const email = req.body.email;

  try {
    const result = await Orders.find({ email: email });
    res.send(result);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send("Error fetching orders");
  }
});




app.listen(port, () => console.log("listening on the port", port));

const Product = require("../modules/Product");
const { productSchema, productUpdateSchema, searchProductSchema, deleteProductSchema, filterSchema} = require("../lib/validators/produc");
const { z } = require("zod");
const pageId = process.env.PAGE_ID;
const userAccessToken = process.env.FACEBOOK_TOKEN;
// const path = require('path');
//const fs = require('fs');

const getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.status(200).json(products);
}

const filterForProduct = async (req, res) =>{
  try {
    const {productName, price, category} =  req.body;
    
    const filter = await Product.find({
      ...(productName? {productName} : {}),
      ...(price? {price} : {}),
      ...(category? {category} : {}),
    })
    
    res.status(200).json(filter);
    
  } catch (error) {
    console.log(error);

      // if (error instanceof z.ZodError) {
      //     const { message } = error.errors[0];
      //     return res.status(422).json({ message: `Validation Error: ${message}` });
      // }

      res.status(500).json({ message: "Internal Server Error" }); 
  }
}

const searchProduct = async (req, res) => {
    try {
        const { productName } = searchProductSchema.parse(
            req.body
        );

        let product;

        if(productName === ""){
          product = await Product.find();
          return  res.status(200).json(product);
        }

        product = await Product.findOne({ productName });

        if(!product){
          return  res.status(404).json({ message: "This product does not exist in the system" });
        } 


        
        res.status(200).json([product]);
        
    } catch (error) {
        console.log(error);

        if (error instanceof z.ZodError) {
            const { message } = error.errors[0];
            return res.status(422).json({ message: `Validation Error: ${message}` });
        }

        res.status(500).json({ message: "Internal Server Error" }); 
    }
}
async function getPageAccessToken() {
  const url = "https://graph.facebook.com/me/accounts?access_token=" + userAccessToken;

  const response = await fetch(url);
  const data = await response.json();
  return data.data[0].access_token;
  
}
// Function to create a private post
async function createPrivatePost(pageAccessToken, message) {
  const url = "https://graph.facebook.com/" + pageId + "/feed";

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message: message,
      access_token: pageAccessToken,
      published: true, // Set to false to make the post private (unpublished)
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Error creating post:', error);
    return;
  }

  const data = await response.json();
  console.log('Post created successfully: ' + JSON.stringify(data));
}
const createProduct = async (req, res) => {
    try {
      const { productName, description, price, category } = productSchema.parse(
        req.body
      );
      const { filename } = req.file;
      const pathImage = `./uploads/${filename}`;
      const productExists = await Product.findOne({ productName });
      
      if (productExists) {
        return res.status(409).json({ message: "Product already exists" });
      }
      
      const product = new Product({
        productName,
        description,
        price,
        pathImage,
        category
      });
      
      product.save();
      (async () => {
        const pageAccessToken = await getPageAccessToken();
        if (pageAccessToken) {
          const message = productName + " product was created";
          createPrivatePost(pageAccessToken, message);
        }
      })();
      //res.status(201).json({ message: "Product created" });
      res.status(201).redirect("/admin/dashboard");
    } catch (error) {
      console.error(error);
  
      if (error instanceof z.ZodError) {
        const { message } = error.errors[0];
        return res.status(422).json({ message: `Validation Error: ${message}` });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  };

  const updateproduct = async (req, res) => {
    try {
        const {id , productName, description, price, category} = productUpdateSchema.parse(
            req.body
        );
        
        const imageDB =  await Product.findById(id);
        let pathImage;

        if(typeof req.file !== 'undefined'){
            const { filename } = req.file;
            pathImage = `./uploads/${filename}`;
            // const pathFile = path.join(__dirname, imageDB.pathImage);
            // console.log(pathFile);
            /*fs.unlink(pathFile, (err) => {
                if (err) {
                  console.error('Error deleting file:', err);
                  throw new Error();
                }
              });*/
        }else{
          pathImage = imageDB.pathImage
        }

        const product ={
            productName,
            description,
            price,
            category,
            pathImage
        };
        
        const data = await Product.findByIdAndUpdate(id, product);

        if(data === null){
          return res.status(204).json({message: "Updated feild"})
        }

        //res.redirect('/');
        res.status(200).json({ message: 'Product updated successfully' });

    } catch (error) {
        console.error(error);

        if (error instanceof z.ZodError) {
            const { message } = error.errors[0];
            return res.status(422).json({ message:` Validation Error: ${message}` });
          }
          res.status(500).json({ message: "Internal Server Error" });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = deleteProductSchema.parse(
          req.body
        );
        
        const data = await Product.findByIdAndDelete(id);

        if(data === null){
          return res.status(204).json({message: "Deleted feild"})
        }

        res.status(200).json({ message: "Product Deleted" });
    } catch (error) {
        console.error(error);

        if (error instanceof z.ZodError) {
          const { message } = error.errors[0];
          return res.status(422).json({ message: `Validation Error: ${message}` });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
}


module.exports = {
  getAllProducts,
  searchProduct,
  createProduct,
  updateproduct,
  deleteProduct,
  filterForProduct
};

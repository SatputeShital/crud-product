const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());// Middleware to parse JSON bodies

// STEP 1 - Establish the mongo db connection
// mongodb connection using async and await
async function mongoDBConnection(){
    try {
        await mongoose.connect("mongodb://localhost:27017/product_database");
        console.log("Connection  established with mongodb successfully..");  
    } catch (error) {
        console.log(error);
    }
}

//step2:Define Schema
const schemaProd=new mongoose.Schema({
    product_name:{type: String},
    price:{type:Number},
    description:{type:String},
    company_name:{type:String},
    color:{type:String},
    material:{type:String}
},
{
    collection:"product-collection",
    timestamps:true
});

//step 3:creating Model
const Product=mongoose.model('Product',schemaProd);

//Step4: Performing Opertaion on database 

//Step a: Method: PUT
//        Endpoint:http://localhost:8081/product/create
//handle error using async and await
app.post("/product/create", async(request,response)=>
{
    //object Destructuring
    const {product_name, price, description, company_name, color, material}=request.body;
    try{
        const productData= await Product.create({
            product_name,
            price,
            description,
            company_name,
            color,
            material
        });
        return response.status(200)
        .json( {
            message: "Given product created successfully...",
         product: productData
        });
    }catch (error)
    {
        response.status(500).json({
            error:"Error occured for Creating Product",
            errorDetails :error.message
        });
    }
});

//step b:Method:GET
//       Endpoint:http://localhost:8081/allproduct

app.get("/allproduct", async (request, response)=>{
    try {
        const productData = await Product.find({}); 
        console.log(response.body);
         
        return response.status(200).json(productData);
    } catch (error) {
        return response.status(500).json("Internal Server Error");
    }
});

//fetch data using perticular key
//EndPoint: http://localhost:8081/product/laptop
app.get("/product/:product_name", async(request,response)=>
{
    try
    {
    const product_nameParam=request.params.product_name;
    const productData= await Product.findOne({product_name:product_nameParam});
    return response.status(200).json(productData);
   }
catch(error)
{
    return response.status(500),json("Internal Sever Error");
}
});

//step c: Method: Put
//       Endpoint:http://localhost:8081/update

app.put("/product/update", async(request, response)=>
{
    try{
        const{product_name, price, description, company_name, color,material}=request.body;
        const productData=await Product.findOneAndUpdate(
            { product_name:product_name},
            {price:price, description:description, company_name:company_name, color:color, material:material},
            {new:true, upsert:true});
        response.status(200).json({message:"Product Data Updated Successfully..", product:productData});
       }
    catch(error)
    {
        console.error("Error occured while Updating product data..", error);
        response.status(500).json({message:"Updating data not done..", error:error.message});
    }
});

//step d: Method: Delete
//        Endpoint: http://localhost:8081/product/product_name
// delete product using product_name
app.delete("/product/:product_name", async(request, response)=>
{
    try{
        const productnameParam=request.params.product_name;
        const productData=await Product.findOne({product_name:productnameParam});
        if (![productData]) {
            return response.status(404).json(`Product not found with Product Name: ${productnameParam}`);
        } else {
            return response.status(200).json({message:"Product is Deleted Successfully",productData});
        }   
    } 
    catch(error)
    {
        return response.status(500).json("Internal Server Error")
    } 
});

// step 5: call mongodatabase function(establish connection function)
mongoDBConnection();

// Step 6: Start Server 
app.listen(8081,()=>{
    console.log("Ready to listen request on port 8081...");   
}
);

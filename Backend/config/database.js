//here i am going to writng the code for the connecting the database

import mongoose from "mongoose";
const Database = async () => {
  try {
    const kabhail = await mongoose.connect(process.env.MONGO_URI);
    console.log("The MongoDB Connected SUccesfully ", kabhail.connection.host);
  } catch (error) {
    console.error("Feiled to connect mongodb ");
  }
};

export default Database;





///now i am going to setup all the task of the authetication of the page main kam controller and the calling path is writen in the routes simply this is the best 


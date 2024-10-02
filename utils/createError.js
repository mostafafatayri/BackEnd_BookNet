const createError = (status, message) => {
    const err = new Error();
    err.status = status;
    err.message = message;
  
    return err;
  };
  
  export default createError;

  

 //  thos is an object for the error so that we can customize our own error to send to the user 
  
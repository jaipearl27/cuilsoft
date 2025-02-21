sample backend .env:-

MONGO_URI=<your mongodb uri here>



sample data:



{
    "eventType": "purchase",
    "userId": "user1234",
    "metadata": {
      "page": "checkout",
      "button": "checkout"
    }
  },


  {
    "eventType": "download",
    "userId": "user4321",
    "metadata": {
      "page": "downloads",
      "button": "download"
    }
  },


  {
    "eventType": "click",
    "userId": "user4321",
    "metadata": {
      "page": "downloads",
      "button": "download"
    }
  }


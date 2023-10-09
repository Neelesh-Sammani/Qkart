import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
//import { Link } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
//import Card from '@mui/material/Card';
import { generateCartItemsFrom } from "./Cart";
//import CardContent from '@mui/material/CardContent';

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product
 */


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */


const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading,setIsLoading] = useState(true);
  const [products,setProducts] = useState([]);
  const [debounceTimeout,setDebounceTimeout] = useState(null);
  const [filteredProducts,setFilteredProducts] = useState([]);
  const [items,setItems] = useState([]);


  const token = localStorage.getItem('token');
  

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    try{
      let response =await axios.get(`${config.endpoint}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      return response.data;
    }catch(e){
      enqueueSnackbar("Could not fetch products. Check that the backend is running, reachable and return valid JSON.",{variant:'error'})
    }finally{
      setIsLoading(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try{
      let response = await axios.get(`${config.endpoint}/products/search?value=${text}`)
      setFilteredProducts(response.data);
      return response.data;
    }catch(e){
      if(e.response){
        if(e.response.status===404){
          setFilteredProducts([]);
          return;
        }
        if(e.response.status===500){
          enqueueSnackbar(e.response.data.message,{variant:'error'})
          return;
        }
        else{
          enqueueSnackbar("Could not fetch products. Check that the backend is running, reachable and return valid JSON.",{variant:'error'})
        }
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {

    if(debounceTimeout){
      clearTimeout(debounceTimeout);
    }

    let timerId = setTimeout(()=>{
      performSearch(event.target.value)
    },500)

    setDebounceTimeout(timerId)
  };

  useEffect(()=>{
    const onLoadHandler = async () => {
      const productsData = await performAPICall();
      const cartData = await fetchCart(token);
      const cartDetails = generateCartItemsFrom(cartData,productsData);
      setItems(cartDetails);
      //console.log(cartDetails);
    }
    onLoadHandler();
  }, []);

/**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
 const fetchCart = async (token) => {
  if (!token) return;

  try {
    // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
    const response = await axios.get(`${config.endpoint}/cart`,{headers:{Authorization:`Bearer ${token}`}});
    return response.data;
  } catch (e) {
    if (e.response && e.response.status === 400) {
      enqueueSnackbar(e.response.data.message, { variant: "error" });
    } else {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error"
        }
      );
    }
    return null;
  }
};
/**
 * Return if a product already is present in the cart
 *
 * @param { Array.<{ productId: String, quantity: Number }> } items
 *    Array of objects with productId and quantity of products in cart
 * @param { String } productId
 *    Id of a product to be checked
 *
 * @returns { Boolean }
 *    Whether a product of the given "productId" exists in the "items" array
 *
 */
 const isItemInCart = (items, productId) => {
  return items.find((item) => item.productId === productId && item.qty > 0) ? true : false;
};


const addToCart = async (
  token,
  items,
  products,
  productId,
  qty,
  options = { preventDuplicate: false }
) => {

  try {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", { variant: 'error' });
      return;
    }

    if (options.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar("Item already in cart. Use the cart sidebar to update quantity or remove item.", { variant: 'warning' });
      return;
    }
    const response = await axios.post(`${config.endpoint}/cart`,{"productId":productId,"qty":qty}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  
    const cartItems = generateCartItemsFrom(response.data,products);
    setItems(cartItems);
    return response.data;

  } catch (e) {
    if (e.response && e.response.status === 400) {
      enqueueSnackbar(e.response.data.message, { variant: "error" });
    } else {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
    }
    return null;
  }
};

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
        className="search-desktop"
        size="small"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>{
          debounceSearch(e,debounceTimeout)
        }}
      />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(e)=>{
          debounceSearch(e,debounceTimeout)
        }}
      />
      
      <Grid container>
       <Grid item xs={12} md={token && products.length > 0 ? 9 : 12} className="product-grid">
         <Box className="hero">
           <p className="hero-heading">
             India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
             to your door step
           </p>
         </Box>
         {isLoading?(
            <Box className="loading">
            <CircularProgress />
            <Typography variant='body1'>Loading Products...</Typography>
            </Box>)

          :
          (<Grid container spacing={2} marginY={1} paddingX={1}>
            {filteredProducts.length?
              (filteredProducts.map((product) =>(
              <Grid key={product._id} item xs={6} md={3}>
                <ProductCard 
                  product={product}
                  handleAddToCart={async () => {await addToCart(token,items,products,product._id,1,{preventDuplicate:true});}} 
                />
              </Grid>)))
              :(
              <Box className="loading">
                <SentimentDissatisfied color="action"/>
                <Typography variant='body1'>No products found</Typography>
              </Box>
            )}
          </Grid>)}
       </Grid>
       {token?(
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Cart products={products} items={items} handleQuantity={addToCart}/>
        </Grid> 
       ):null}
      </Grid>
      <Footer />
    </div>
  );
};

export default Products;

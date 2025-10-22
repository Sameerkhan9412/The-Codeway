import { configureStore } from '@reduxjs/toolkit'
import authReducer from "../slice/authSlice";
import problemReducer from "../slice/problemSlice"

const store = configureStore({
    reducer:{
        auth:authReducer,
        problems: problemReducer
    }
})

export default store;
'use server';

import axios from "axios";
import { Metadata } from "next";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setAuthCookie, getAuthCookie, clearAuthCookie } from "@/app/sever/authcookie/route";
const AUTH_COOKIE_NAME = "authToken";

dotenv.config();

const API_KEY = process.env.API_KEY;
const BE_API_BASE_URL = process.env.BE_API_BASE_URL;

async function callPythonAPI(endpoint: string, data: object): Promise<any> {
  try {
    const response = await axios.post(`${BE_API_BASE_URL}/${endpoint}`, data, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 30000,
    });

    return response.data;

  } catch (error: any) {
    if (error.code === 'ECONNABORTED') {
      return "Máy chủ bận, thử lại sau.";
    }

    if (!error.response) {
      throw new Error("Lỗi kết nối tới máy chủ.");
    }

    if (error.response && error.response.status !== 500) {
      return error.response.data || { success: false, message: "Lỗi không xác định." };
    }

    throw new Error("Máy chủ không phản hồi (500).");
  }
}




export async function login_acc(datauser: any): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Không có dữ liệu.",
    };
  }

  try {
    const response = await callPythonAPI("login", { datauser, api_key: API_KEY });
    if (response.status === 200) {

      const token = response.data.token;
      if (token) {
        setAuthCookie(token);
        return response;
      } else {
        return {
          success: false,
          message: "Đăng nhập failed.",
        };
      }
    } else {
      return response;
    }
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function register_acc(datauser: any): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("register", { datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function forgot_password(datauser): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("forgot_password", { datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function check_token_reset(datauser): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("check_token_reset", { datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function set_newpass(datauser): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("set_newpass", { datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function show_books(): Promise<any> {
  
  try {
    const response = await callPythonAPI("show_books", { api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function add_book_review(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  console.log(datauser)
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("add_book_review", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function show_book_reviews(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  console.log(datauser)
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("show_book_reviews", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function get_statistics(datauser: any): Promise<any> {
  if (!datauser) {
    return {
      success: false,
      message: "Missing data.",
    };
  }

  try {
    const response = await callPythonAPI("get_statistics", { datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function show_book_search(keyword: string): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "";

  if (!keyword || keyword.trim() === "") {
    return {
      success: false,
      message: "Thiếu từ khóa tìm kiếm.",
    };
  }

  try {
    const response = await callPythonAPI("show_book_search", {
      api_key: API_KEY,
      token,
      keyword: keyword.trim(),
    });

    // Flask trả về { success, books, count } → giữ nguyên
    return response;
  } catch (error: any) {
    console.error("❌ Lỗi khi gọi show_book_search:", error);
    return {
      success: false,
      message: error?.message || "Lỗi khi gọi API show_book_search.",
    };
  }
}

// export async function check_str(): Promise<any> {
//   try {
//     const response = { "server": "Ziang - 2025", "domain": "ziii.me", "y": "2025" };
    
//     // Bạn có thể thực hiện các bước xử lý cần thiết với response ở đây
//     return {
//       success: true,
//       data: response
//     };
//   } catch (error) {
//     // Đảm bảo luôn trả về success: true, ngay cả khi có lỗi
//     return {
//       success: true,
//       message: "Dữ liệu không thể tải, nhưng vẫn trả về thành công.",
//     };
//   }
// }

// cách lấy cookie
// const token = req.cookies.authToken;
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

export async function get_book_admin(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_book_admin", { token, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function del_book_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("del_book_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function add_book_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  
  try {
    const response = await callPythonAPI("add_book_admin1", { token, datauser, api_key: API_KEY });
    console.log(response)
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function edit_book_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_book_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function get_authors_and_categories(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_authors_and_categories", { token, api_key: API_KEY });
    
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function get_publishers(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_publishers", { token, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function get_news(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_news", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function get_authors(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_authors", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function add_authors(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("add_authors", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function del_authors(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("del_authors", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function edit_authors(datauser): Promise<any> {
  const cookieStore = cookies();
 
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_authors", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function get_user(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_user", { token, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function edit_email_admin(datauser): Promise<any> {
  const cookieStore = cookies();
 
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_email_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function edit_pass_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_pass_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function del_user_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("del_user_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function edit_role_admin(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_role_admin", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function add_publishers(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("add_publishers", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function del_publishers(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("del_publishers", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function edit_publishers(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_publishers", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function del_categories(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("del_categories", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function add_categories(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("add_categories", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function edit_categories(datauser): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("edit_categories", { token, datauser, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}


export async function get_borrow_return(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";
  try {
    const response = await callPythonAPI("get_borrow_return", { token, api_key: API_KEY });
    return response;
  } catch (error) { 
    return {
      success: false,
      message: error.message || "Check failed.",
    };
  }
}

export async function add_borrow_return(datauser: any): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";

  try {
    const response = await callPythonAPI("add_borrow_return", {
      token,
      api_key: API_KEY,
      datauser,
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi khi thêm bản ghi mượn.",
    };
  }
}


export async function edit_borrow_return(datauser: any): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";

  try {
    const response = await callPythonAPI("edit_borrow_return", {
      token,
      api_key: API_KEY,
      datauser,
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi khi sửa bản ghi mượn.",
    };
  }
}


export async function get_statistics(): Promise<any> {
  const cookieStore = cookies();
  const token = cookieStore.get("authToken")?.value || "Không có token";

  try {
    const response = await callPythonAPI("get_statistics", {
      token,
      api_key: API_KEY,
    });
    return response;
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Lỗi khi lấy thống kê.",
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
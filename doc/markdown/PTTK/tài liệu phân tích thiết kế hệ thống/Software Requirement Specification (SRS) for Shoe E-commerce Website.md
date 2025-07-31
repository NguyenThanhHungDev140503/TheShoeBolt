# Software Requirement Specification (SRS) for Shoe E-commerce Website

## Table of Contents

1.  [Introduction](#introduction)
    1.1. [Purpose](#purpose)
    1.2. [Scope](#scope)
    1.3. [Definitions, Acronyms, and Abbreviations](#definitions-acronyms-and-abbreviations)
    1.4. [References](#references)
    1.5. [Overall Document](#overall-document)
2.  [Overall Description](#overall-description)
    2.1. [Systems View](#systems-view)
    2.2. [User Characteristics](#user-characteristics)
    2.3. [Constraints](#constraints)
    2.4. [Assumption and Dependency](#assumption-and-dependency)
3.  [Specific Requirements](#specific-requirements)
    3.1. [Functional Requirements](#functional-requirements)
    3.2. [Non-Functional Requirements](#non-functional-requirements)
    3.3. [Interface Requirements](#interface-requirements)
    3.4. [System Requirements](#system-requirements)
4.  [Limit](#limit)
5.  [Appendices](#appendices)

## 1. Introduction

### 1.1. Purpose

Mục đích của tài liệu này là xác định các yêu cầu chức năng và phi chức năng của hệ thống website bán giày trực tuyến. Hệ thống sẽ cung cấp một nền tảng để khách hàng có thể duyệt, tìm kiếm, mua giày, quản lý đơn hàng và thanh toán trực tuyến.

### 1.2. Scope

Website bán giày trực tuyến sẽ hỗ trợ các chức năng như:

#### 1.2.1. Người dùng

*   Duyệt danh mục sản phẩm
*   Hiển thị chi tiết sản phẩm
*   Tìm kiếm giày:
    1.  Cơ bản: theo tên
    2.  Nâng cao: theo loại (category), collection, giá cả, kích thước, màu sắc, chất liệu, tag (men, women, sale, new, …)
*   Lọc sản phẩm: theo loại (category), collection, giá cả, kích thước, màu sắc, chất liệu, tag (men, women, sale, new, …)
*   Đăng ký tài khoản với email, số điện thoại, tài khoản google
*   Đặt hàng và thanh toán trực tuyến (khi đã đăng ký tài khoản)
*   Áp dụng các chương trình khuyến mãi, mã giảm giá khi mua hàng
*   Thêm sản phẩm vào giỏ hàng
*   Đăng ký wishlist (Đăng ký nhận thông báo về sản phẩm mới, khi đã đăng ký tài khoản)
*   Đánh giá sản phẩm
*   Theo dõi đơn hàng: trạng thái đơn hàng, lịch sử đơn hàng
*   Nhận thông báo từ hệ thống
*   Thêm sản phẩm vào danh sách yêu thích
*   Khách hàng xem lại các đơn hàng đã mua, đã hủy, đang giao, chờ xác nhận
*   Phản hồi, đánh giá sản phẩm
*   Nhắn tin với quản trị viên
*   Có thể mua hàng với tư cách khách vãng lai

#### 1.2.2. Shipper

Xác nhận đã giao hàng thành công

#### 1.2.3. Quản trị viên

Quản lý tài khoản người dùng

*   Tạo tài khoản shipper
*   Có khả năng phân quyền cho các tài khoản linh động
*   Mỗi quyền có các chức năng được phân chia rõ ràng

Quản lý sản phẩm

*   Quản trị viên có thể thêm, sửa, xóa sản phẩm và xử lý sản phẩm
*   Quản trị viên có thể thêm, sửa, xóa danh mục sản phẩm

Quản lí đơn hàng

*   Xem các đơn hàng trong một khoảng thời gian/ xem chi tiết một đơn hàng
*   Đánh dấu đơn hàng: chưa xử lý (khách hàng mới đặt) và đã xử lý

Thống kê

*   Thống kê tình hình kinh doanh trong một khoảng thời gian của các sản phẩm thuộc một loại / tất cả sản phẩm.
*   Thống kê sản phẩm bán chạy theo khoảng thời gian

Quản lý khuyến mãi

*   Tạo, sửa, xóa chương trình khuyến mãi, mã giảm giá
*   Dashboard theo dõi: Phát triển giao diện quản trị cho phép admin xem báo cáo hiệu quả của từng chương trình khuyến mãi, bao gồm số lượng đơn hàng tạo ra, doanh thu tăng thêm, số lượt sử dụng và phản hồi của khách hàng.

Phản hồi khách hàng

*   Xem, xử lý phản hồi từ khách hàng

### 1.3. Definitions, Acronyms, and Abbreviations

*   **SRS (Software Requirement Specification):** Tài liệu đặc tả yêu cầu phần mềm
*   **UI (User Interface):** Giao diện người dùng
*   **UX (User Experience):** Trải nghiệm người dùng
*   **CMS (Content Management System):** Hệ thống quản lý nội dung
*   **API (Application Programming Interface):** Giao diện lập trình ứng dụng
*   **Sản phẩm:** Giày các loại, bao gồm thể thao, casual.
*   **Người dùng:** Khách hàng sử dụng website để mua hàng.
*   **Quản trị viên:** Người quản lý sản phẩm, đơn hàng trên hệ thống.
*   **Shipper:** Người giao hàng, xác nhận đơn hàng giao thành công.
*   **Đơn hàng:** Giao dịch mua hàng từ người dùng.

### 1.4. References

*   PCI DSS - Tiêu chuẩn bảo mật thanh toán trực tuyến.
*   W3C Web Accessibility Guidelines - Tiêu chuẩn truy cập web.
*   REST API Design Best Practices
*   OWASP Top 10 Security Guidelines

### 1.5. Overall Document

Tài liệu bao gồm mô tả tổng quan hệ thống, các yêu cầu chức năng và phi chức năng, các use case chính, cùng với giới hạn và ràng buộc của hệ thống.

## 2. Overall Description

### 2.1. Systems View

*   Website là một hệ thống thương mại điện tử độc lập.
*   Kiến trúc hệ thống theo mô hình MVC với backend REST API NestJS.
*   Dữ liệu được lưu trữ trong PostgresSQL.
*   Hỗ trợ tích hợp với hệ thống thanh toán bên thứ ba như Stripe.
*   Xác thực người dùng bằng Clerk
*   Gửi email bằng Resend

### 2.2. User Characteristics

*   **Khách hàng:** Người dùng có thể đăng nhập, đăng ký tài khoản mới, duyệt sản phẩm, đặt hàng, tạo giỏ hàng, đăng ký wishlist và thanh toán trực tuyến.
*   **Quản trị viên:** Người có quyền đăng nhập; tạo tài khoản; phân quyền; quản lý sản phẩm; đơn hàng; tài khoản khách hàng, shipper; kiểm soát hệ thống; Xem thông kê.
*   **Shipper:** Người xác nhận giao hàng thành công cho khách hàng.

### 2.3. Constraints

*   Website phải hoạt động trên các trình duyệt phổ biến (Chrome, Firefox, Safari, Edge)
*   Phải tuân thủ các quy định bảo mật dữ liệu khách hàng
*   Hệ thống thanh toán phải hỗ trợ các phương thức phổ biến như thẻ tín dụng, ví điện tử.

### 2.4. Assumption and Dependency

*   Người dùng có kết nối internet.
*   Phụ thuộc vào cổng thanh toán bên thứ ba.
*   Tính năng đăng nhập phụ thuộc vào hệ thống thứ ba: Clerk
*   Tính năng thanh toán phụ thuộc vào hệ thống thứ ba: Stripe
*   Tính năng gửi email phụ thuộc vào hệ thống thứ ba: Resend

## 3. Specific Requirements

### 3.1. Functional Requirements

| ID      | Tên yêu cầu               | Mô tả                                                                                                                            |
| :------ | :------------------------ | :------------------------------------------------------------------------------------------------------------------------------- |
| FR-001  | Đăng ký người dùng        | Người dùng có thể đăng ký tài khoản bằng email, số điện thoại, tài khoản google; Sử dụng Clerk.                                 |
| FR-002  | Đăng nhập                 | Hỗ trợ đăng nhập bằng mật khẩu và tài khoản google.                                                                             |
| FR-003  | Duyệt danh mục sản phẩm   | Hiển thị danh mục sản phẩm một cách trực quan, cho phép người dùng dễ dàng duyệt qua các sản phẩm.                              |
| FR-004  | Hiển thị chi tiết sản phẩm | Hiển thị đầy đủ thông tin về sản phẩm như: hình ảnh, mô tả, giá cả, kích cỡ, màu sắc, v.v.                                      |
| FR-005  | Tìm kiếm sản phẩm cơ bản  | Người dùng có thể tìm kiếm sản phẩm theo tên.                                                                                   |
| FR-006  | Tìm kiếm sản phẩm nâng cao | Người dùng có thể tìm kiếm sản phẩm theo danh mục (category), loại (tag), giá cả, collection.                                  |
| FR-007  | Lọc sản phẩm              | Người dùng có thể lọc sản phẩm theo loại (category), collection, giá cả, kích thước, màu sắc, chất liệu, tag (men, women, sale, new). |
| FR-008  | Giỏ hàng                  | Người dùng có thể thêm/xóa sản phẩm vào giỏ hàng.                                                                               |
| FR-009  | Wishlist                  | Người dùng có thể đăng ký nhận thông báo về các sản phẩm chuẩn bị về; Dùng Resend để gửi email thông báo.                       |
| FR-010  | Danh sách yêu thích (Favorites) | Người dùng có thể thêm sản phẩm vào danh mục yêu thích.                                                                        |
| FR-011  | Đánh giá sản phẩm         | Người dùng có thể đánh giá và viết nhận xét về sản phẩm đã mua.                                                                 |
| FR-012  | Áp dụng khuyến mãi        | Người dùng có thể áp dụng các chương trình khuyến mãi, mã giảm giá khi mua hàng.                                                |
| FR-013  | Áp dụng nhiều mã giảm giá | Hệ thống hỗ trợ áp dụng nhiều mã giảm giá cùng lúc cho một đơn hàng.                                                            |
| FR-014  | Thanh toán                | Hỗ trợ thanh toán bằng thẻ tín dụng, ví điện tử, tiền mặt; Dùng Stripe để hỗ trợ thanh toán online.                             |
| FR-015  | Theo dõi đơn hàng         | Người dùng có thể theo dõi trạng thái đơn hàng, lịch sử đơn hàng.                                                               |
| FR-016  | Quản lý đơn hàng          | Người dùng có thể kiểm tra các đơn hàng đã mua, đã hủy, đang giao, chờ xác nhận.                                                |
| FR-017  | Nhận thông báo            | Người dùng xem thông báo từ hệ thống.                                                                                           |
| FR-018  | Nhắn tin với quản trị viên | Người dùng gửi tin nhắn cho quản trị viên.                                                                                     |
| FR-019  | Không cần đăng nhập khi mua hàng | Người dùng có thể mua hàng với tư cách khách vãng lai.                                                                         |
| FR-020  | Mua hàng từ trang sản phẩm | Người dùng có thể mua hàng trực tiếp từ trang chi tiết sản phẩm.                                                               |
| FR-021  | Mua hàng từ trang giỏ hàng | Người dùng có thể mua hàng từ trang giỏ hàng.                                                                                   |
| FR-022  | Xác nhận giao hàng        | Shipper xác nhận đã giao hàng thành công.                                                                                       |
| FR-023  | Quản trị sản phẩm         | Admin có thể thêm, sửa, xóa sản phẩm.                                                                                           |
| FR-024  | Quản lý danh mục sản phẩm | Admin có thể thêm sửa xóa danh mục sản phẩm như: sport, casual, giày da, giày lười.                                            |
| FR-025  | Quản lý đơn hàng (Admin)  | Admin có thể xem các đơn hàng trong một khoảng thời gian, xem chi tiết một đơn hàng, đánh dấu đơn hàng đã xử lý hoặc chưa xử lý. |
| FR-026  | Quản lý người dùng        | Admin có thể tạo các tài khoản cho shipper.                                                                                     |
| FR-027  | Quản lý quyền người dùng  | Admin có thể cấp quyền cho các tài khoản người dùng một cách linh động.                                                         |
| FR-028  | Thống kê theo loại sản phẩm | Admin xem biểu đồ lợi nhuận của một loại giày trong một khoảng thời gian.                                                       |
| FR-029  | Thống kê tổng thể         | Admin xem biểu đồ lợi nhuận của toàn bộ trang web trong một khoảng thời gian.                                                   |
| FR-030  | Thống kê sản phẩm bán chạy | Admin xem thống kê sản phẩm bán chạy theo khoảng thời gian.                                                                     |
| FR-031  | Quản lý khuyến mãi        | Admin có thể tạo, sửa, xóa chương trình khuyến mãi.                                                                             |
| FR-032  | Quản lý mã giảm giá       | Admin có thể tạo, sửa, xóa mã giảm giá.                                                                                         |
| FR-033  | Dashboard theo dõi        | Admin xem báo cáo hiệu quả của từng chương trình khuyến mãi, bao gồm số lượng đơn hàng tạo ra, doanh thu tăng thêm, số lượt sử dụng. |
| FR-034  | Phản hồi khách hàng       | Admin xem, xử lý phản hồi từ khách hàng.                                                                                        |

### 3.2. Non-Functional Requirements

| ID    | Tên yêu cầu                                                               |
| :---- | :------------------------------------------------------------------------ |
| NFR-1 | Hệ thống phải có giao diện thân thiện, dễ sử dụng                         |
| NFR-2 | Hiệu suất hệ thống phải đáp ứng tối thiểu 100 người dùng đồng thời       |
| NFR-3 | Dữ liệu phải được mã hóa để bảo vệ thông tin khách hàng                  |
| NFR-4 | Thời gian phản hồi của trang web phải dưới 2 giây                        |
| NFR-5 | Hệ thống phải hỗ trợ đa ngôn ngữ (Tiếng Anh, Tiếng Việt)                 |

### 3.3. Interface Requirements

*   **Giao diện người dùng:** Thiết kế theo chuẩn Material Design.
*   **API hệ thống:** RESTful API theo chuẩn OpenAPI.
*   **Giao diện thanh toán:** Tích hợp VNPay, Stripe.

### 3.4. System Requirements

*   **Yêu cầu phần cứng:** Server tối thiểu 4 CPU, 16GB RAM.
*   **Yêu cầu phần mềm:** Node.js (backend), React.js (frontend), MySQL.

## 4. Limit

*   Hệ thống chỉ hỗ trợ thanh toán VNPay, Stripe trong giai đoạn đầu.
*   Chỉ hỗ trợ giao hàng trong nội địa Việt Nam.

## 5. Appendices

*   **Phương thức thanh toán:** Stripe, VNPay
*   **Công nghệ sử dụng:** React.js, NodeJS (NextJS), MongoDB, MySQL
*   **Bảo mật:** Tuân thủ tiêu chuẩn OWASP Top 10



# TheShoeBolt Product Context

## Tại Sao Dự Án Này Tồn Tại

### Vấn Đề Cần Giải Quyết

1.  **Thị trường giày dép cần nền tảng chuyên biệt và trải nghiệm mua sắm tốt hơn:**
    *   Người mua cần thông tin chi tiết và chính xác về sản phẩm (size, material, style, fit).
    *   Cần hình ảnh sản phẩm chất lượng cao, đa góc độ.
    *   Hướng dẫn chọn size (size guide) và gợi ý phù hợp (fit recommendations) là cực kỳ quan trọng để giảm tỷ lệ đổi trả.
    *   Các nền tảng hiện tại thường thiếu công cụ tìm kiếm và bộ lọc đủ chi tiết cho đặc thù ngành hàng giày dép.
    *   Thiếu sự hỗ trợ tư vấn real-time về size, kiểu dáng phù hợp.
    *   Quy trình thanh toán và theo dõi đơn hàng cần liền mạch và minh bạch hơn.

2.  **Quản lý kinh doanh giày dép trực tuyến phức tạp và cần tự động hóa:**
    *   Quản lý tồn kho (inventory management) phức tạp với nhiều biến thể (size, color).
    *   Khối lượng công việc hỗ trợ khách hàng (customer service) lớn, cần các công cụ tự động hóa và quản lý hiệu quả.
    *   Cần hệ thống phân tích dữ liệu (analytics) mạnh mẽ để hiểu hành vi mua sắm của khách hàng và tối ưu hóa chiến lược kinh doanh.
    *   Quản lý các chương trình khuyến mãi, mã giảm giá cần linh hoạt và dễ dàng.

### Cơ Hội Thị Trường

-   Thương mại điện tử ngành hàng giày dép (E-commerce footwear) là một phân khúc đang tăng trưởng mạnh mẽ.
-   Người tiêu dùng ngày càng quen thuộc và thoải mái hơn với việc mua giày trực tuyến.
-   Công nghệ hỗ trợ như thử giày ảo (virtual try-on) và gợi ý size thông minh đang ngày càng hoàn thiện.
-   Thương mại di động (Mobile commerce) chiếm tỷ trọng lớn và tiếp tục tăng trưởng trong phân khúc này.
-   Nhu cầu về một nền tảng chuyên biệt, cung cấp trải nghiệm vượt trội cho cả người mua và người bán.

## Giải Pháp Đề Xuất

### Value Proposition (Giá trị Cốt lõi)

**"TheShoeBolt: Nền tảng thương mại điện tử giày dép thông minh, mang đến trải nghiệm mua sắm cá nhân hóa, tiện lợi với sự hỗ trợ chuyên nghiệp và quy trình quản lý vận hành hiệu quả."**

### Key Differentiators (Điểm Khác Biệt Chính)

1.  **Smart Search & Discovery (Tìm kiếm & Khám phá Thông minh):**
    *   Hệ thống tìm kiếm mạnh mẽ (Elasticsearch) với các bộ lọc chuyên biệt cho giày dép (thương hiệu, size, màu, giá, kiểu dáng, chất liệu, tags).
    *   Gợi ý sản phẩm thông minh dựa trên hành vi và sở thích người dùng.
    *   Hiển thị tình trạng còn hàng (availability) real-time theo size và màu sắc.

2.  **Expert Support System (Hệ thống Hỗ trợ Chuyên nghiệp):**
    *   Chat hỗ trợ real-time với chuyên viên tư vấn size và kiểu dáng.
    *   Cộng đồng đánh giá sản phẩm và chia sẻ kinh nghiệm chọn size.
    *   Hệ thống quản lý phản hồi khách hàng tập trung.

3.  **Seamless Shopping Experience (Trải nghiệm Mua sắm Liền mạch):**
    *   Quy trình thanh toán nhanh chóng, an toàn với nhiều lựa chọn (tích hợp Stripe).
    *   Ước tính chi phí vận chuyển và thời gian giao hàng real-time.
    *   Chính sách đổi trả dễ dàng, đặc biệt cho các vấn đề về size.
    *   Theo dõi đơn hàng chi tiết.

4.  **Advanced Admin Tools (Công cụ Quản trị Nâng cao):**
    *   Dashboard quản trị toàn diện: quản lý sản phẩm (với biến thể), tồn kho, đơn hàng, khách hàng, khuyến mãi.
    *   Hệ thống phân tích dữ liệu kinh doanh, báo cáo chi tiết.
    *   Công cụ tạo và quản lý chiến dịch marketing, email (tích hợp Resend).
    *   Phân quyền chi tiết cho quản trị viên (RBAC).

## Cách Thức Hoạt Động

### Customer Journey (Hành trình Khách hàng)

1.  **Discovery Phase (Giai đoạn Khám phá):**
    *   Truy cập website, duyệt qua các danh mục, bộ sưu tập hoặc sử dụng công cụ tìm kiếm.
    *   Áp dụng các bộ lọc chi tiết (thương hiệu, size, màu, giá, kiểu dáng, chất liệu, tags).
    *   Xem thông tin chi tiết sản phẩm, hình ảnh đa góc độ, video (nếu có), đọc đánh giá từ người dùng khác.

2.  **Evaluation Phase (Giai đoạn Đánh giá):**
    *   So sánh các sản phẩm với nhau.
    *   Tham khảo hướng dẫn chọn size, gợi ý độ vừa vặn.
    *   Sử dụng chat real-time để được tư vấn thêm nếu cần.
    *   Thêm sản phẩm vào Wishlist hoặc Danh sách yêu thích.

3.  **Purchase Phase (Giai đoạn Mua hàng):**
    *   Thêm sản phẩm vào giỏ hàng với lựa chọn size, màu sắc.
    *   Xem lại giỏ hàng, áp dụng mã giảm giá (nếu có).
    *   Điền thông tin giao hàng, chọn phương thức vận chuyển.
    *   Hoàn tất thanh toán qua cổng thanh toán tích hợp (Stripe).
    *   Có thể mua hàng với tư cách khách vãng lai (không cần đăng nhập).

4.  **Post-Purchase (Sau Mua hàng):**
    *   Nhận email xác nhận đơn hàng và các thông báo cập nhật trạng thái.
    *   Theo dõi quá trình vận chuyển đơn hàng real-time.
    *   Nhận sản phẩm, kiểm tra.
    *   Có thể yêu cầu đổi/trả hàng theo chính sách.
    *   Để lại đánh giá, nhận xét về sản phẩm và dịch vụ.
    *   Nhận các thông báo về sản phẩm trong wishlist (nếu có).

### Admin Operations (Hoạt động của Quản trị viên)

1.  **Product & Inventory Management (Quản lý Sản phẩm & Tồn kho):**
    *   Thêm, sửa, xóa sản phẩm với đầy đủ thuộc tính (tên, mô tả, hình ảnh, giá, size, màu, chất liệu, danh mục, bộ sưu tập, tags).
    *   Quản lý số lượng tồn kho chính xác cho từng biến thể sản phẩm.
    *   Thiết lập quy tắc giá, tạo và quản lý các chương trình khuyến mãi, mã giảm giá.

2.  **Order Fulfillment & Shipping (Xử lý Đơn hàng & Vận chuyển):**
    *   Xem và xử lý đơn hàng mới (xác nhận, chuẩn bị hàng).
    *   Cập nhật trạng thái đơn hàng.
    *   Tích hợp với đơn vị vận chuyển để tạo vận đơn và theo dõi.
    *   Xử lý các yêu cầu đổi/trả hàng, hoàn tiền.

3.  **Customer Relations & Support (Quan hệ & Hỗ trợ Khách hàng):**
    *   Theo dõi và trả lời tin nhắn, phản hồi từ khách hàng.
    *   Quản lý tài khoản người dùng, xem lịch sử mua hàng.
    *   Phân tích dữ liệu khách hàng để cá nhân hóa trải nghiệm.

4.  **System & Content Management (Quản lý Hệ thống & Nội dung):**
    *   Quản lý danh mục, bộ sưu tập.
    *   Cấu hình các cài đặt hệ thống (phương thức thanh toán, vận chuyển).
    *   Xem báo cáo, thống kê hiệu quả kinh doanh, hiệu quả khuyến mãi.
    *   Phân quyền cho các tài khoản quản trị khác.

### Shipper Operations (Hoạt động của Shipper)
1.  **Order Assignment & Tracking (Nhận đơn & Theo dõi):**
    *   Xem danh sách các đơn hàng được phân công.
    *   Cập nhật trạng thái đơn hàng (đã lấy hàng, đang giao, giao thành công/thất bại).
2.  **Delivery Confirmation (Xác nhận Giao hàng):**
    *   Tải lên bằng chứng giao hàng (hình ảnh, chữ ký).
    *   Báo cáo các vấn đề phát sinh trong quá trình giao hàng.

## Mục Tiêu Trải Nghiệm Người Dùng (User Experience Goals)

### For Customers (Dành cho Khách hàng)
-   **Effortless Discovery (Khám phá Dễ dàng)**: Tìm được sản phẩm mong muốn hoặc khám phá sản phẩm mới một cách nhanh chóng và trực quan.
-   **Confident Purchase (Mua hàng Tự tin)**: Cảm thấy tự tin về lựa chọn size và chất lượng sản phẩm trước khi mua.
-   **Fast & Secure Checkout (Thanh toán Nhanh chóng & An toàn)**: Hoàn tất quy trình mua hàng trong ít bước nhất có thể với các tùy chọn thanh toán an toàn.
-   **Transparent Process (Quy trình Minh bạch)**: Luôn được cập nhật về trạng thái đơn hàng từ lúc đặt đến khi nhận hàng.
-   **Personalized Experience (Trải nghiệm Cá nhân hóa)**: Nhận được gợi ý sản phẩm và khuyến mãi phù hợp với sở thích.

### For Admins (Dành cho Quản trị viên)
-   **Unified Dashboard (Bảng điều khiển Thống nhất)**: Có cái nhìn tổng quan và chi tiết về mọi hoạt động kinh doanh trên một giao diện duy nhất.
-   **Efficient Operations (Vận hành Hiệu quả)**: Giảm thiểu các thao tác thủ công thông qua tự động hóa và quy trình tối ưu.
-   **Data-Driven Decisions (Quyết định dựa trên Dữ liệu)**: Sử dụng các báo cáo và phân tích sâu sắc để đưa ra quyết định về sản phẩm, tồn kho, marketing.
-   **Scalable Management (Quản lý có Khả năng Mở rộng)**: Hệ thống có thể đáp ứng sự tăng trưởng về số lượng sản phẩm, đơn hàng và người dùng.

### For Support Staff (Dành cho Nhân viên Hỗ trợ)
-   **Context-Rich Interactions (Tương tác Giàu ngữ cảnh)**: Truy cập nhanh chóng lịch sử mua hàng và tương tác của khách hàng khi hỗ trợ qua chat.
-   **Quick Resolution (Giải quyết Nhanh chóng)**: Giảm thời gian trung bình để giải quyết một yêu cầu hỗ trợ.
-   **Knowledge Base Access (Truy cập Cơ sở tri thức)**: Dễ dàng tìm kiếm thông tin sản phẩm, chính sách để tư vấn cho khách hàng.

### For Shippers (Dành cho Shipper)
-   **Clear Task Assignment (Phân công Nhiệm vụ Rõ ràng)**: Dễ dàng xem các đơn hàng cần giao và thông tin chi tiết.
-   **Easy Status Update (Cập nhật Trạng thái Dễ dàng)**: Cập nhật trạng thái giao hàng một cách nhanh chóng, có thể kèm bằng chứng.

## Success Metrics (Chỉ số Thành công)

### Business Metrics (Chỉ số Kinh doanh)
-   Tỷ lệ chuyển đổi (Conversion rate) > mục tiêu đề ra.
-   Giá trị đơn hàng trung bình (Average Order Value - AOV) tăng trưởng.
-   Tỷ lệ giữ chân khách hàng (Customer Retention Rate) > mục tiêu.
-   Tỷ lệ đổi trả hàng (Return Rate) < mức trung bình ngành.
-   Doanh thu và lợi nhuận tăng trưởng theo kế hoạch.

### User Experience Metrics (Chỉ số Trải nghiệm Người dùng)
-   Thời gian tải trang (Page Load Time) < 2 giây.
-   Điểm hài lòng của khách hàng (Customer Satisfaction Score - CSAT) > 4.5/5.
-   Thời gian tìm kiếm và hoàn tất tác vụ (Task Completion Time) giảm.
-   Tỷ lệ thoát trang (Bounce Rate) ở các trang quan trọng thấp.

### Technical Metrics (Chỉ số Kỹ thuật)
-   Thời gian hoạt động của hệ thống (System Uptime) > 99.9%.
-   Thời gian phản hồi API (API Response Time) trung bình < 200ms.
-   Tỷ lệ lỗi (Error Rate) < 0.1%.
-   Khả năng chịu tải (Peak Concurrent Users Support) đáp ứng yêu cầu.
-   Mức độ bao phủ của kiểm thử tự động (Test Coverage) > 80%.
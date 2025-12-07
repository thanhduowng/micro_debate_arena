# 🗳️ Micro-Debate Arena

Một nền tảng tranh luận phi tập trung được xây dựng trên IOTA blockchain sử dụng Move smart contracts. Người dùng có thể tạo các cuộc tranh luận về bất kỳ chủ đề nào và tham gia vào một trong hai phe (Side A hoặc Side B).

![IOTA](https://img.shields.io/badge/IOTA-Move-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 Mục Lục

- [Tính Năng](#-tính-năng)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Thông Tin Kỹ Thuật](#-thông-tin-kỹ-thuật)
- [Yêu Cầu Hệ Thống](#-yêu-cầu-hệ-thống)
- [Cài Đặt và Chạy](#-cài-đặt-và-chạy)
- [Hướng Dẫn Sử Dụng](#-hướng-dẫn-sử-dụng)
- [Smart Contract](#-smart-contract)
- [API Reference](#-api-reference)

---

## ✨ Tính Năng

### Smart Contract
- ✅ **Tạo Tranh Luận**: Bất kỳ ai cũng có thể tạo cuộc tranh luận mới với chủ đề và mô tả
- ✅ **Tham Gia Phe**: Chọn Side A hoặc Side B để tham gia
- ✅ **Theo Dõi Thống Kê**: Đếm số người tham gia mỗi phe theo thời gian thực
- ✅ **Ngăn Chặn Gian Lận**: Mỗi địa chỉ chỉ có thể tham gia một phe cho mỗi cuộc tranh luận
- ✅ **Events**: Phát ra events khi tạo tranh luận hoặc tham gia

### Frontend
- 🎨 **UI Đẹp Mắt**: Thiết kế hiện đại với gradient và animations
- 📱 **Responsive**: Hoạt động tốt trên mọi thiết bị
- 🔄 **Real-time Updates**: Tự động cập nhật thống kê mỗi 10 giây
- 💼 **Wallet Integration**: Kết nối ví IOTA dễ dàng
- 🎯 **Trạng Thái**: Hiển thị rõ ràng phe đã tham gia
- ⚡ **Loading States**: Feedback trực quan cho mọi thao tác

---

## 📁 Cấu Trúc Dự Án

```
micro_debate_arena/
│
├── app/                                    # Next.js App Router
│   ├── layout.tsx                          # Layout chính với Provider
│   ├── page.tsx                            # Trang chủ
│   └── globals.css                         # Styles toàn cục
│
├── components/                             # React Components
│   ├── Provider.tsx                        # IOTA Wallet Provider
│   ├── Wallet-connect.tsx                  # Component kết nối ví
│   ├── sample.tsx                          # UI chính của Micro-Debate Arena
│   ├── CreateDebate.tsx                    # Form tạo tranh luận (không dùng)
│   ├── DebateList.tsx                      # Danh sách tranh luận (không dùng)
│   └── DebateCard.tsx                      # Card hiển thị tranh luận (không dùng)
│
├── hooks/                                  # Custom React Hooks
│   └── useContract.ts                      # Hook tương tác với contract
│
├── lib/                                    # Configurations
│   └── config.ts                           # Cấu hình network và Package ID
│
├── contract/micro_debate_arena/            # Move Smart Contract
│   ├── sources/
│   │   └── micro_debate_arena.move         # Main contract file
│   ├── Move.toml                           # Move package configuration
│   ├── DEPLOYMENT_GUIDE.md                 # Hướng dẫn deploy chi tiết
│   └── QUICK_REFERENCE.md                  # Tài liệu tham khảo nhanh
│
├── scripts/                                # Automation Scripts
│   ├── iota-deploy-wrapper.js              # Script tự động deploy
│   └── iota-generate-prompt-wrapper.js     # Generate prompts
│
├── package.json                            # Dependencies và scripts
├── next.config.ts                          # Next.js configuration
├── tsconfig.json                           # TypeScript configuration
└── README.md                               # File này
```

---

## 🔧 Thông Tin Kỹ Thuật

### Stack Công Nghệ

#### Frontend
- **Framework**: Next.js 14.2.23 (App Router)
- **Language**: TypeScript 5
- **UI Library**: Radix UI (@radix-ui/themes)
- **Styling**: Tailwind CSS 3.4.1
- **State Management**: React Hooks
- **Blockchain Integration**: @iota/dapp-kit 0.0.8

#### Smart Contract
- **Language**: Move (IOTA Move)
- **Platform**: IOTA Blockchain
- **Network**: Devnet/Testnet/Mainnet
- **Object Model**: Shared Objects
- **Storage**: Table (dynamic storage)

### Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                       Frontend (Next.js)                     │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  sample.tsx│  │ Wallet-connect│  │   Provider.tsx   │    │
│  └─────┬──────┘  └──────┬───────┘  └────────┬─────────┘    │
│        │                 │                    │               │
│        └─────────────────┴────────────────────┘              │
│                          │                                    │
└──────────────────────────┼────────────────────────────────────┘
                           │
                   ┌───────▼────────┐
                   │  @iota/dapp-kit │
                   │  IOTA Client    │
                   └───────┬────────┘
                           │
┌──────────────────────────▼────────────────────────────────────┐
│                   IOTA Blockchain                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │           Smart Contract (Move)                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │  │
│  │  │    Debate    │  │    Events    │  │   Table     │  │  │
│  │  │ (Shared Obj) │  │ DebateCreated│  │ participants│  │  │
│  │  │              │  │ JoinedDebate │  │             │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Tạo Tranh Luận**:
   ```
   User Input → sample.tsx → signAndExecute → Smart Contract
   → create_debate() → Emit DebateCreated Event → Share Object
   ```

2. **Tham Gia Phe**:
   ```
   User Click → sample.tsx → signAndExecute → Smart Contract
   → join_debate() → Update Table → Emit JoinedDebate Event
   ```

3. **Hiển Thị Dữ Liệu**:
   ```
   useEffect → Query DebateCreated Events → Get Debate IDs
   → getObject() for each ID → Query JoinedDebate Events
   → Update UI với thống kê
   ```

---

## 💻 Yêu Cầu Hệ Thống

### Phần Mềm Cần Thiết
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0 hoặc **yarn**
- **IOTA CLI**: Latest version
- **Git**: Để clone repository

### Môi Trường
- **OS**: Windows, macOS, hoặc Linux
- **Browser**: Chrome, Firefox, Edge (hỗ trợ Web3)
- **Wallet**: IOTA Wallet Extension

### Kiến Thức Khuyến Nghị
- React/Next.js cơ bản
- TypeScript cơ bản
- Move language (để chỉnh sửa smart contract)
- Blockchain/Web3 concepts

---

## 🚀 Cài Đặt và Chạy

### Bước 1: Clone Repository

```bash
git clone <repository-url>
cd micro_debate_arena
```

### Bước 2: Cài Đặt Dependencies

```bash
npm install --legacy-peer-deps
```

**Lưu ý**: Sử dụng `--legacy-peer-deps` vì một số package có peer dependency conflicts.

### Bước 3: Cài Đặt IOTA CLI

```bash
# Sử dụng Cargo (Rust)
cargo install --locked --git https://github.com/iotaledger/iota.git --branch develop iota

# Kiểm tra cài đặt
iota --version
```

### Bước 4: Cấu Hình IOTA Testnet

```bash
# Thêm môi trường testnet
iota client new-env --alias testnet --rpc https://api.testnet.iota.cafe:443

# Chuyển sang testnet
iota client switch --env testnet

# Tạo địa chỉ mới hoặc import
iota client new-address ed25519

# Lấy token testnet
iota client faucet
```

### Bước 5: Deploy Smart Contract

```bash
# Di chuyển vào thư mục contract
cd contract/micro_debate_arena

# Build contract
iota move build

# Deploy lên testnet
iota client publish --gas-budget 100000000

# Lưu lại Package ID từ output!
```

### Bước 6: Cập Nhật Package ID

Mở file `lib/config.ts` và cập nhật Package ID:

```typescript
export const DEVNET_PACKAGE_ID = "0xYOUR_PACKAGE_ID_HERE"
```

### Bước 7: Chạy Development Server

```bash
# Quay về thư mục gốc
cd ../..

# Chạy dev server
npm run dev
```

Mở trình duyệt tại: **http://localhost:3000**

---

## 📖 Hướng Dẫn Sử Dụng

### Kết Nối Ví

1. Click nút **"Connect Wallet"** ở góc trên
2. Chọn ví IOTA của bạn
3. Approve kết nối

### Tạo Tranh Luận

1. Click **"+ Create New Debate"**
2. Nhập **Topic** (tối đa 100 ký tự)
3. Nhập **Description** (tối đa 500 ký tự)
4. Click **"Create Debate"**
5. Xác nhận transaction trong ví
6. Đợi transaction được xác nhận

### Tham Gia Tranh Luận

1. Tìm tranh luận bạn muốn tham gia
2. Click **"Join Side A"** hoặc **"Join Side B"**
3. Xác nhận transaction
4. Bạn sẽ thấy badge hiển thị phe đã tham gia

### Xem Thống Kê

- **Progress Bar**: Hiển thị tỷ lệ % của mỗi phe
- **Participant Count**: Số người tham gia từng phe
- **Total**: Tổng số người tham gia
- **Your Status**: Badge màu hiển thị phe bạn đã tham gia

---

## 🔐 Smart Contract

### Cấu Trúc Debate Object

```move
public struct Debate has key {
    id: UID,
    topic: String,              // Chủ đề tranh luận
    description: String,        // Mô tả chi tiết
    side_a_count: u64,         // Số người Side A
    side_b_count: u64,         // Số người Side B
    total_participants: u64,   // Tổng số người
    participants: Table<address, u8>,  // Map address -> side
}
```

### Functions

#### `create_debate(topic: String, description: String)`
- Tạo tranh luận mới
- Shared object, ai cũng có thể tương tác
- Emit `DebateCreated` event

#### `join_debate(debate: &mut Debate, side: u8)`
- Tham gia tranh luận
- `side`: 0 = Side A, 1 = Side B
- Check duplicate join
- Emit `JoinedDebate` event

### Events

```move
// Khi tạo tranh luận
public struct DebateCreated has copy, drop {
    debate_id: ID,
    topic: String,
    description: String,
    creator: address,
}

// Khi tham gia
public struct JoinedDebate has copy, drop {
    debate_id: ID,
    participant: address,
    side: u8,
}
```

### Error Codes

- **E_ALREADY_JOINED (1)**: Đã tham gia tranh luận này rồi
- **E_INVALID_SIDE (2)**: Side phải là 0 hoặc 1

---

## 📚 API Reference

### Frontend Hooks

#### `useIotaClient()`
```typescript
const iotaClient = useIotaClient()
// Methods:
// - queryEvents(): Query blockchain events
// - getObject(): Get object by ID
// - getOwnedObjects(): Get objects owned by address
```

#### `useSignAndExecuteTransaction()`
```typescript
const { mutate: signAndExecute } = useSignAndExecuteTransaction()

signAndExecute(
  { transaction: tx },
  {
    onSuccess: (result) => { /* ... */ },
    onError: (error) => { /* ... */ }
  }
)
```

#### `useCurrentAccount()`
```typescript
const currentAccount = useCurrentAccount()
// Returns: { address: string, ... } | null
```

### Smart Contract View Functions

```move
public fun get_topic(debate: &Debate): String
public fun get_description(debate: &Debate): String
public fun get_side_a_count(debate: &Debate): u64
public fun get_side_b_count(debate: &Debate): u64
public fun get_total_participants(debate: &Debate): u64
public fun has_joined(debate: &Debate, participant: address): bool
```

---

## 🐛 Debugging

### Console Logs

Mở DevTools (F12) và kiểm tra Console:
- `DebateCreated events`: Tất cả events tạo tranh luận
- `Debate IDs found`: Danh sách ID tranh luận
- `JoinedDebate events`: Events tham gia
- `Debates loaded`: Dữ liệu cuối cùng
- `User joined sides`: Map phe đã tham gia

### Common Issues

**Không thấy tranh luận sau khi tạo:**
- Kiểm tra Package ID trong `lib/config.ts`
- Kiểm tra Console logs
- Đợi 10 giây để auto-refresh

**Transaction failed:**
- Kiểm tra gas trong ví
- Chạy `iota client faucet` để lấy thêm token
- Kiểm tra bạn chưa join tranh luận này

**UI không cập nhật:**
- Hard refresh (Ctrl + Shift + R)
- Kiểm tra network trong DevTools
- Xem Console có lỗi không

---

## 🚢 Deployment

### Deploy Smart Contract lên Mainnet

```bash
# Switch sang mainnet
iota client switch --env mainnet

# Deploy
iota client publish --gas-budget 100000000

# Update Package ID trong lib/config.ts
export const MAINNET_PACKAGE_ID = "0x..."
```

### Deploy Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

---

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

## 🤝 Contributing

Contributions, issues và feature requests đều được chào đón!

1. Fork dự án
2. Tạo branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📞 Support

- **Documentation**: [contract/micro_debate_arena/DEPLOYMENT_GUIDE.md](contract/micro_debate_arena/DEPLOYMENT_GUIDE.md)
- **Quick Reference**: [contract/micro_debate_arena/QUICK_REFERENCE.md](contract/micro_debate_arena/QUICK_REFERENCE.md)
- **IOTA Docs**: https://docs.iota.org/
- **Move Book**: https://move-language.github.io/move/

---

## 🎯 Roadmap

- [ ] Thêm voting system
- [ ] Thêm comments cho mỗi tranh luận
- [ ] Tích hợp IPFS cho lưu trữ nội dung dài
- [ ] Thêm badges/achievements cho users
- [ ] Trending debates
- [ ] User profiles
- [ ] NFT rewards

---

**Made with ❤️ using IOTA Move & Next.js**
# micro_debate_arena

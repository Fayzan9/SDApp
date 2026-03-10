### **User Testing Checklist (Phase 1)**

Please use this checklist to verify the application. If any step fails or feels "off", let me know!

COMPLETED - Means implemented and tested sucessfully

### **1. Visual Builder**

- **Drag & Drop**: Drag a `Server` from the library to the canvas. COMPLETED
- **Selection**: Click the `Server` node. Does the right panel show its properties? COMPLETED
- **Editing**: Change `Instances` to `5`. Click away and click back—is the value preserved? COMPLETED
- **Deletion**: With the `Server` selected, click the **Trash** icon in the properties panel. Does it disappear? COMPLETED

### **2. Connections & Validation**

- **Valid Flow**: Connect `Web Client` (right handle) to `Load Balancer` (left handle). Does a line appear with a moving dot? COMPLETED
- **Validation Check**: Try to connect a `Load Balancer` output to a `Web Client` (which has no input handle). React Flow should physically prevent this because the Client has no "target" handle. COMPLETED
- **Self-Connection**: Try to connect a node to itself. You should see a **Red Error Toast** in the bottom-right. COMPLETED

### **3. Persistence & UI**

- **Naming**: Click "Untitled Architecture" in the header. Rename it to "Test System" and press Enter. COMPLETED
- **Saving**: Create a small design (Client → Server) and click **Save Design**. You should see a **Green Success Toast**. COMPLETED
- **Clearing**: Click the **Clear** button. The canvas should empty. COMPLETED
- **Loading**: Click **Open**, find "Test System", and click it. Does your Client → Server design reappear exactly as it was? COMPLETED
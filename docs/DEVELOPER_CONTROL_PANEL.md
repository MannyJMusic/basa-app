# Developer Control Panel

The `DevControlPanel` is a comprehensive, collapsible development interface that provides organized access to all developer tools and debugging features. It's designed to be reusable across different pages and can be easily expanded as development progresses.

## Features

### 🎛️ **Collapsible Interface**
- **Minimal footprint**: Takes up only 12px when collapsed
- **Expandable**: Grows to 384px (24rem) when expanded
- **Hideable**: Can be completely hidden with a floating "Show Dev Panel" button
- **Smooth animations**: 300ms transitions for all state changes

### 📋 **Organized Tabs**
1. **Notifications** - Payment and email status information
2. **Email Logger** - Real-time email system monitoring
3. **Database** - Database connection and user management tools
4. **Tools** - Email testing, payment testing, and environment info

### 🎯 **Smart Status Indicators**
- Shows payment readiness status
- Displays email system status
- Environment information
- Quick access to common actions

## Usage

### Basic Implementation

```tsx
import { DevControlPanel } from '@/components/dev/DevControlPanel'

export default function MyPage() {
  return (
    <DevControlPanel
      paymentData={paymentData}
      emailStatus={emailStatus}
    >
      {/* Your page content */}
      <div>Your page content here</div>
    </DevControlPanel>
  )
}
```

### With Payment Data

```tsx
<DevControlPanel
  paymentData={{
    cart: [
      {
        tierId: 'associate-member',
        name: 'Associate Member',
        price: 245.00,
        quantity: 1
      }
    ],
    total: 245.00
  }}
  emailStatus={{
    active: true,
    paymentId: 'pi_1234567890',
    customerEmail: 'user@example.com'
  }}
>
  {/* Page content */}
</DevControlPanel>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `React.ReactNode` | The page content to wrap |
| `paymentData` | `any` | Payment information for status indicators |
| `emailStatus` | `any` | Email system status information |
| `className` | `string` | Additional CSS classes |

## Development-Only Features

The DevControlPanel only appears in development mode (`NODE_ENV !== 'production'`). In production, it simply renders the children without any developer interface.

## Customization

### Adding New Tabs

1. Add a new tab trigger in the `TabsList`:
```tsx
<TabsTrigger value="new-tab" className="flex items-center space-x-2">
  <NewIcon className="h-3 w-3" />
  <span className="hidden sm:inline">New Tab</span>
</TabsTrigger>
```

2. Add the corresponding content:
```tsx
<TabsContent value="new-tab" className="h-full m-0">
  <Card className="h-full">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">New Tab Title</CardTitle>
    </CardHeader>
    <CardContent className="h-full overflow-auto">
      {/* Your new tab content */}
    </CardContent>
  </Card>
</TabsContent>
```

### Adding New Tools

The Tools tab is designed to be easily expandable. Simply add new buttons or sections to the existing grid layout.

## Integration Examples

### Payment Success Page
```tsx
<DevControlPanel
  paymentData={checkoutData}
  emailStatus={{ 
    active: true, 
    paymentId, 
    customerEmail: checkoutData?.customerInfo?.email 
  }}
>
  {/* Payment success content */}
</DevControlPanel>
```

### Membership Join Page
```tsx
<DevControlPanel
  paymentData={cart.length > 0 ? { cart, total: subtotal } : undefined}
  emailStatus={{ active: true, customerEmail: contactInfo.email }}
>
  {/* Membership join content */}
</DevControlPanel>
```

## Benefits

1. **Clean UI**: Developer tools don't clutter the main interface
2. **Organized**: All tools are logically grouped in tabs
3. **Reusable**: Can be used on any page that needs developer tools
4. **Expandable**: Easy to add new features and tools
5. **Production-safe**: Automatically disabled in production
6. **Responsive**: Works well on mobile and desktop

## Future Enhancements

- **Keyboard shortcuts** for quick access
- **Customizable layouts** for different development workflows
- **Plugin system** for third-party development tools
- **Persistent settings** for developer preferences
- **Real-time collaboration** features for team development 
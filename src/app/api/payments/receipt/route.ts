import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const paymentId = searchParams.get('paymentId')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentId)
    if (!paymentIntent || !paymentIntent.metadata) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Parse all relevant metadata fields
    const cart = paymentIntent.metadata.cart ? JSON.parse(paymentIntent.metadata.cart) : []
    const additionalMembers = paymentIntent.metadata.additionalMembers ? JSON.parse(paymentIntent.metadata.additionalMembers) : []
    const customerInfo = paymentIntent.metadata.customerInfo ? JSON.parse(paymentIntent.metadata.customerInfo) : undefined
    const businessInfo = paymentIntent.metadata.businessInfo ? JSON.parse(paymentIntent.metadata.businessInfo) : undefined
    const contactInfo = paymentIntent.metadata.contactInfo ? JSON.parse(paymentIntent.metadata.contactInfo) : undefined
    const total = paymentIntent.amount ? paymentIntent.amount / 100 : 0

    return NextResponse.json({
      cart,
      additionalMembers,
      total,
      customerInfo,
      businessInfo,
      contactInfo
    })
  } catch (err) {
    console.error('Failed to fetch payment receipt:', err)
    return NextResponse.json({ error: 'Failed to fetch payment receipt' }, { status: 500 })
  }
} 
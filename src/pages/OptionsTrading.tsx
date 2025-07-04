import React, { useState, useEffect } from 'react'
import { Search, TrendingUp, TrendingDown, Plus, Minus, Calculator, Share2, AlertTriangle, Shield } from 'lucide-react'
import { useOptionsContext } from '../context/OptionsContext'
import { PolygonService } from '../services/polygonService'
import { CommunityService } from '../services/communityService'
import TradingViewWidget from '../components/TradingViewWidget' 
import Disclaimer from '../components/Disclaimer'
import type { OptionsContract } from '../types/options'

export default function OptionsTrading() {
  const { state, dispatch } = useOptionsContext()
  const [contracts, setContracts] = useState<OptionsContract[]>([])
  const [selectedContract, setSelectedContract] = useState<string | null>(null)
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [tradeType, setTradeType] = useState<'buy_to_open' | 'sell_to_close'>('buy_to_open')
  const [quantity, setQuantity] = useState('')
  const [limitPrice, setLimitPrice] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOptionsContracts()
  }, [])

  const loadOptionsContracts = async () => {
    try {
      setLoading(true)
      const topContracts = PolygonService.getTopLiquidOptions()
      setContracts(topContracts)
    } catch (error) {
      console.error('Failed to load options contracts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${(percent * 100).toFixed(2)}%`
  }

  const selectedContractData = contracts.find(contract => contract.ticker === selectedContract)
  const existingPosition = state.positions.find(pos => pos.contractTicker === selectedContract)

  const handlePlaceOrder = () => {
    if (!selectedContract || !quantity || parseInt(quantity) <= 0) return

    const contract = contracts.find(c => c.ticker === selectedContract)
    if (!contract) return

    const orderQuantity = parseInt(quantity)
    const price = orderType === 'market' ? contract.last : parseFloat(limitPrice)
    const totalCost = orderQuantity * price * 100 // Options are per 100 shares

    // Validation
    if (tradeType === 'buy_to_open') {
      if (totalCost > state.buyingPower) {
        alert('Insufficient buying power')
        return
      }
    } else {
      if (!existingPosition || existingPosition.quantity < orderQuantity) {
        alert('Insufficient contracts to sell')
        return
      }
    }

    if (orderType !== 'market' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      alert('Please enter a valid limit price')
      return
    }

    dispatch({
      type: 'PLACE_OPTIONS_ORDER',
      payload: {
        contractTicker: selectedContract,
        underlyingTicker: contract.underlying_ticker,
        type: tradeType,
        orderType,
        quantity: orderQuantity,
        price: orderType === 'market' ? undefined : parseFloat(limitPrice),
        status: 'pending'
      }
    })

    // Reset form
    setQuantity('')
    setLimitPrice('')
    alert(`${tradeType.replace('_', ' ').toUpperCase()} order placed for ${orderQuantity} contracts of ${selectedContract}`)
    
    // Offer to share trade with community
    if (CommunityService.hasConfiguredPlatforms()) {
      const shouldShare = confirm('Would you like to share this trade with the community?')
      if (shouldShare) {
        handleShareTrade(contract, orderQuantity, price, tradeType)
      }
    }
  }
  
  const handleShareTrade = async (
    contract: OptionsContract, 
    quantity: number, 
    price: number, 
    type: string
  ) => {
    const alert = {
      symbol: contract.underlying_ticker,
      action: type.includes('buy') ? 'buy' as const : 'sell' as const,
      price,
      quantity,
      strategy: `${contract.contract_type.toUpperCase()} ${contract.strike_price} ${contract.expiration_date}`,
      reasoning: `Options trade: ${type.replace('_', ' ')} ${quantity} contracts of ${contract.ticker} at $${price.toFixed(2)}`
    }
    
    try {
      await CommunityService.shareTradingAlert(alert)
    } catch (error) {
      console.error('Failed to share trade:', error)
    }
  }

  const estimatedCost = selectedContractData && quantity 
    ? parseInt(quantity) * (orderType === 'market' ? selectedContractData.last : parseFloat(limitPrice) || 0) * 100
    : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-500">Loading options contracts...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Trading Disclaimer */}
      <div className="lg:col-span-3">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Important Risk Disclaimer</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Options trading involves substantial risk and is not suitable for all investors. The valuation of options may fluctuate, and as a result, you may lose more than your original investment.
                </p>
                <p className="mt-1">
                  This platform is for educational purposes only. Past performance is not indicative of future results. Consider your investment objectives before trading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
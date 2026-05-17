import { useState, useEffect } from 'react'
import { RotateCcw, Check, X, Clock, MessageSquare } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'completed']
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
}

export default function AdminReturns() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [notesInput, setNotesInput] = useState({})
  const [tableExists, setTableExists] = useState(true)

  useEffect(() => { fetchReturns() }, [])

  async function fetchReturns() {
    const { data, error } = await supabase
      .from('return_requests')
      .select('*, orders(id, customer_name, email, total, created_at)')
      .order('created_at', { ascending: false })
    if (error) {
      if (error.code === '42P01' || error.message?.includes('does not exist')) setTableExists(false)
      setLoading(false)
      return
    }
    setReturns(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    const notes = notesInput[id] || ''
    await supabase.from('return_requests').update({
      status,
      admin_notes: notes || null,
      updated_at: new Date().toISOString(),
    }).eq('id', id)
    fetchReturns()
  }

  const filtered = filter === 'all' ? returns : returns.filter(r => r.status === filter)

  if (loading) {
    return <div className="animate-pulse space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-lg" />)}</div>
  }

  if (!tableExists) {
    return (
      <div className="text-center py-16">
        <RotateCcw size={48} className="mx-auto text-gray-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Returns Table Not Found</h2>
        <p className="text-gray-500 text-sm max-w-md mx-auto">
          Run the SQL from <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">supabase/schema.sql</code> in your Supabase SQL Editor.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Return Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{returns.length} total requests</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all', ...STATUS_OPTIONS].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition ${
              filter === s ? 'bg-black text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && <span className="ml-1 opacity-60">({returns.filter(r => r.status === s).length})</span>}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <RotateCcw size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No {filter === 'all' ? '' : filter} return requests</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ret => (
            <div key={ret.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[ret.status]}`}>{ret.status}</span>
                    <span className="text-xs text-gray-400">{new Date(ret.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="text-sm font-medium">Order #{ret.order_id?.slice(0, 8)}</p>
                  <p className="text-xs text-gray-500">{ret.user_email}</p>
                  {ret.orders && (
                    <p className="text-xs text-gray-500">{ret.orders.customer_name} — {'\u20B9'}{ret.orders.total?.toLocaleString('en-IN')}</p>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Reason</p>
                <p className="text-sm text-gray-800">{ret.reason}</p>
              </div>

              {ret.admin_notes && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <p className="text-xs font-medium text-blue-600 mb-1">Admin Notes</p>
                  <p className="text-sm text-blue-800">{ret.admin_notes}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2 border-t">
                <input
                  value={notesInput[ret.id] || ret.admin_notes || ''}
                  onChange={e => setNotesInput(n => ({ ...n, [ret.id]: e.target.value }))}
                  placeholder="Add a note (optional)..."
                  className="flex-1 border rounded-lg px-3 py-1.5 text-xs"
                />
                {ret.status === 'pending' && (
                  <>
                    <button onClick={() => updateStatus(ret.id, 'approved')}
                      className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-green-700 transition">
                      <Check size={12} /> Approve
                    </button>
                    <button onClick={() => updateStatus(ret.id, 'rejected')}
                      className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-red-700 transition">
                      <X size={12} /> Reject
                    </button>
                  </>
                )}
                {ret.status === 'approved' && (
                  <button onClick={() => updateStatus(ret.id, 'completed')}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-700 transition">
                    <Check size={12} /> Mark Completed
                  </button>
                )}
                {(ret.status === 'rejected' || ret.status === 'completed') && (
                  <button onClick={() => updateStatus(ret.id, 'pending')}
                    className="flex items-center gap-1 bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-300 transition">
                    <Clock size={12} /> Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

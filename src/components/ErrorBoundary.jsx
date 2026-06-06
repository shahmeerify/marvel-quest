import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-bg-primary p-6 text-center">
          <div className="max-w-sm space-y-4">
            <div className="text-5xl">💥</div>
            <h2 className="font-heading text-2xl text-white">Something went wrong</h2>
            <p className="text-sm text-muted">{this.state.error?.message}</p>
            <button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload() }}
              className="px-6 py-2.5 bg-accent-red text-white rounded-xl text-sm font-semibold hover:bg-accent-darkred transition-colors"
            >
              Reload App
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

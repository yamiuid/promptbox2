import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * 错误边界组件 - 捕获并处理React组件树中的JavaScript错误
 * 防止整个应用崩溃
 */
class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // 更新状态，下次渲染时显示降级UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 记录错误信息
    console.error('ErrorBoundary捕获到错误:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // 这里可以将错误信息发送到错误报告服务
    // reportError(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // 降级UI
      return (
        <div className="error-boundary-container" style={{
          padding: '20px',
          margin: '20px',
          border: '1px solid #f5222d',
          borderRadius: '4px',
          backgroundColor: '#fff1f0'
        }}>
          <h2 style={{ color: '#f5222d' }}>应用程序发生错误</h2>
          <p style={{ margin: '10px 0' }}>我们遇到了一些问题。以下是错误详情：</p>
          <details style={{ whiteSpace: 'pre-wrap', margin: '10px 0' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              查看错误详情
            </summary>
            <p>{this.state.error && this.state.error.toString()}</p>
            <p style={{ marginTop: '10px' }}>组件堆栈信息:</p>
            <pre style={{ 
              backgroundColor: '#f6f8fa', 
              padding: '10px', 
              overflow: 'auto',
              maxHeight: '300px'
            }}>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </details>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
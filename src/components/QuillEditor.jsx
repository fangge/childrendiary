import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const QuillEditor = ({ value, onChange, placeholder = '请输入内容...', className = '' }) => {
  const containerRef = useRef(null);
  const quillRef = useRef(null);
  const isUpdatingRef = useRef(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;
    
    // 标记为已初始化
    isInitializedRef.current = true;

    // 创建编辑器容器
    const editorDiv = document.createElement('div');
    containerRef.current.appendChild(editorDiv);

    // 初始化Quill编辑器
    const quill = new Quill(editorDiv, {
      theme: 'snow',
      placeholder,
      modules: {
        toolbar: [
          [{ 'header': [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ 'list': 'ordered'}, { 'list': 'bullet' }],
          [{ 'color': [] }, { 'background': [] }],
          ['link'],
          ['clean']
        ]
      }
    });

    quillRef.current = quill;

    // 设置初始内容
    if (value) {
      quill.root.innerHTML = value;
    }

    // 监听内容变化
    quill.on('text-change', () => {
      if (isUpdatingRef.current) return;
      
      const html = quill.root.innerHTML;
      // 如果内容为空，返回空字符串而不是 <p><br></p>
      const content = html === '<p><br></p>' ? '' : html;
      
      if (onChange) {
        onChange(content);
      }
    });

    // 清理函数
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
      // 清理DOM
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      isInitializedRef.current = false;
    };
  }, []);

  // 当外部value变化时更新编辑器内容
  useEffect(() => {
    if (!quillRef.current) return;
    
    const currentContent = quillRef.current.root.innerHTML;
    const normalizedCurrent = currentContent === '<p><br></p>' ? '' : currentContent;
    const normalizedValue = value || '';
    
    if (normalizedValue !== normalizedCurrent) {
      isUpdatingRef.current = true;
      const selection = quillRef.current.getSelection();
      quillRef.current.root.innerHTML = normalizedValue || '<p><br></p>';
      if (selection) {
        quillRef.current.setSelection(selection);
      }
      isUpdatingRef.current = false;
    }
  }, [value]);

  return (
    <div className={`quill-editor-wrapper border rounded-lg ${className}`}>
      <div ref={containerRef} style={{ minHeight: '200px' }} />
    </div>
  );
};

export default QuillEditor;
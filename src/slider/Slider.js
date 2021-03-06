import React from 'react';
import { Component, PropTypes } from '../utils/';
import Button from './Button';

export default class Slider extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentValue: props.value,
      firstValue: 0,
      secondValue: 0,
    }
  }
  componentWillMount() {
    let { firsValue, secendValue } = this.state;
    const { value } = this.props;

    if (value instanceof Array) {
      firsValue = this.setResultConversion(value[0])
      secendValue = this.setResultConversion(value[1]);
    } else {
      firsValue = this.setResultConversion(value);
    }
    this.setState({
      firsValue, secendValue
    })
  }
  componentDidMount() {
    const { firsValue, secendValue } = this.state;
    this.setSliderBar(firsValue, secendValue, true)
  }
  getChildContext() {
    return {
      component: this
    };
  }
  getSliderSize() {
    const { slider } = this.refs;
    return parseInt(this.props.vertical ? slider.offsetHeight : slider.offsetWidth, 10);
  }
  isRange() {
    const { value } = this.props;
    if (value instanceof Array && value.length > 1) return true;
    return false;
  }
  isDragging(bool) {
    this.dragging = bool
  }
  onSliderClick(event) {
    const { vertical, disabled } = this.props;
    const { firsValue, secendValue } = this.state;
    if (this.dragging) return;
    if (disabled) return;
    const sliderOffset = this.refs.slider.getBoundingClientRect();
    let sliderOffsetValue = 0
    if (vertical) {
      sliderOffsetValue = (sliderOffset.bottom - event.clientY) / this.getSliderSize() * 100;
    } else {
      sliderOffsetValue = ((event.clientX - sliderOffset.left) / this.getSliderSize() * 100)
    }
    sliderOffsetValue = parseInt(sliderOffsetValue, 10);

    if (this.isRange()) {
      let range = secendValue - firsValue;
      // let btn1 = this.refs.btn1.refs.button.style[vertical ? 'bottom' : 'left'];
      // let btn2 = this.refs.btn2.refs.button.style[vertical ? 'bottom' : 'left'];
      // btn1 = parseInt(btn1, 10);
      // btn2 = parseInt(btn2, 10);
      if (range + firsValue > sliderOffsetValue) {
        this.refs.btn1.startPoint = sliderOffsetValue;
        this.setState({ firsValue: sliderOffsetValue }, () => {
          this.setSliderBar(sliderOffsetValue, secendValue)
        })
        this.setButtonPosition(this.refs.btn1, sliderOffsetValue);
      } else {
        this.refs.btn2.startPoint = sliderOffsetValue;
        this.setState({ secendValue: sliderOffsetValue }, () => {
          this.setSliderBar(firsValue, sliderOffsetValue)
        })
        this.setButtonPosition(this.refs.btn2, sliderOffsetValue);
      }
    } else {
      this.refs.btn1.startPoint = sliderOffsetValue;
      this.setButtonPosition(this.refs.btn1, sliderOffsetValue);
      this.setSliderBar(sliderOffsetValue, secendValue)
    }
  }
  // 刻度显示
  stepArray(marks) {
    const { min, max, step } = this.props;
    const pointCount = (max - min) / step;
    const stepWidth = 100 * step / (max - min);
    const result = [];
    for (let i = 1; i < pointCount; i++) {
      result.push(i * stepWidth);
    }
    return result
  }
  setResultConversion(num) {
    const { min, max } = this.props;
    return parseInt((num - min) / (max - min) * 100, 10)
  }
  // 拖拽刻度
  setMarkPosition(num) {
    const { min, max, step, dots } = this.props;
    const stepWidth = 100 * step / (max - min);     // 实际占用 宽度值
    let rem = num % stepWidth;                      // 实际间隔余 宽度值
    const range = (step - min) / (max - min) * 100; // 实际间隔 宽度值
    let currentv = parseInt((min + num * (max - min) / 100), 10)  // 当前值
    // num，stepWidth 是转换后的值
    // 倍数
    let multiple = parseInt((num / range + 1), 10);
    if (!dots) return num
    if (currentv % step >= step / 2) {
      return multiple * range
    } else {
      return num - rem
    }
  }
  onChange(firsValue, secendValue) {
    const { max, min, onChange } = this.props;
    // 百分百转换值
    firsValue = parseInt((min + firsValue * (max - min) / 100), 10)
    secendValue = parseInt((min + secendValue * (max - min) / 100), 10)
    // 相同值不触发 事件
    if (this._firsValue === firsValue) return;
    if (this.isRange() && this._firsValue === firsValue && this._secendValue === secendValue) return;
    this._firsValue = firsValue;
    this._secendValue = secendValue;

    if (this.isRange()) {
      onChange([firsValue, secendValue])
    } else {
      onChange(firsValue)
    }
  }
  setSliderBar(firsValue, secendValue, isMount) {
    const { value, vertical } = this.props;
    let leftv = firsValue > secendValue ? secendValue : firsValue;
    firsValue = this.setMarkPosition(firsValue);
    leftv = this.setMarkPosition(leftv);

    let widthv = firsValue > secendValue ? firsValue - leftv : secendValue - leftv;
    widthv = this.setMarkPosition(widthv);

    if (value instanceof Array && value.length > 1) {
      !isMount && this.onChange(firsValue, secendValue)
      this.refs.bar.style[vertical ? 'bottom' : 'left'] = leftv + '%';
      this.refs.bar.style[vertical ? 'height' : 'width'] = widthv + '%';
    } else {
      !isMount && this.onChange(firsValue, secendValue)
      this.refs.bar.style[vertical ? 'height' : 'width'] = firsValue + '%';
    }
  }
  // 设置按钮的位置
  setButtonPosition(comp, num) {
    const { vertical } = this.props;
    num = this.setMarkPosition(num)
    if (vertical) {
      comp.refs.button.style.bottom = num + '%';
    } else {
      comp.refs.button.style.left = num + '%';
    }
  }
  // 判断是否冗余过多触发事件
  isRedundancyEvent() {

  }
  onDragChange() {
    const { min, max, disabled, onDragChange } = this.props;
    let { firsValue, secendValue } = this.state;
    if (disabled) return;

    // 百分百转换值
    firsValue = parseInt((min + firsValue * (max - min) / 100), 10)
    secendValue = parseInt((min + secendValue * (max - min) / 100), 10)
    // 相同值不触发 事件
    if (this.__firsValue === firsValue && this.__secendValue === secendValue) return;
    if (this.isRange() && this._firsValue === firsValue && this._secendValue === secendValue) return;
    this.__firsValue = firsValue;
    this.__secendValue = secendValue;

    onDragChange(this.isRange() ? [firsValue, secendValue] : firsValue);
  }
  onFirstValueChange(firsValue) {
    const { secendValue } = this.state;
    this.setState({ firsValue }, () => {
      this.setButtonPosition(this.refs.btn1, firsValue);
      this.setSliderBar(firsValue, secendValue)
      this.onDragChange()

    })
  }
  onSecondValueChange(secendValue) {
    const { firsValue } = this.state;
    this.setState({ secendValue }, () => {
      this.setButtonPosition(this.refs.btn2, secendValue);
      this.setSliderBar(firsValue, secendValue)
      this.onDragChange()
    })
  }
  isActive(num) {
    const { value } = this.props;
    const { firsValue, secendValue } = this.state;
    if (value instanceof Array) {
      if (firsValue < secendValue && num > firsValue && num < secendValue) {
        return true
      }
      if (firsValue > secendValue && num > secendValue && num < firsValue) {
        return true
      }
      return false
    } else if (num < firsValue) {
      return true
    } else {
      return false
    }
  }
  // 刻度标记
  renderMarks() {
    const { prefixCls, vertical, marks, max, min } = this.props;
    return (
      <div className={`${prefixCls}-marks`}>
        {
          Object.keys(marks).map((item, idx) => {
            let label = marks[item];
            let style = {
              [vertical ? 'bottom' : 'left']: parseInt((item - min) / (max - min) * 100, 10) + '%'
            }
            if (label instanceof Object) {
              style = { ...style, ...label.style };
              label = label.label || '';
            }
            return (
              <div key={idx} className={this.classNames(`${prefixCls}-marks-text`, {
                [`w-active`]: this.isActive(item)
              })}
                style={style}
              >{label}</div>
            )
          })
        }
      </div>
    )
  }
  render() {
    const { prefixCls, marks, className, color, style, disabled, vertical } = this.props;
    const { firsValue, secendValue } = this.state;
    return (
      <div ref="slider" style={style}
        className={this.classNames(`${prefixCls}`, className, {
          'w-disabled': disabled,
          [`${prefixCls}-vertical`]: vertical,
        })}
        onClick={this.onSliderClick.bind(this)}
      >
        <div className={this.classNames(`${prefixCls}-track`)}>
          <div ref="bar" style={{ backgroundColor: color }} className={`${prefixCls}-bar`}> </div>
          <Button ref="btn1" value={firsValue} onChange={this.onFirstValueChange.bind(this)} />
          {
            this.isRange() && <Button ref="btn2" value={secendValue} onChange={this.onSecondValueChange.bind(this)} />
          }
          {
            marks && this.stepArray().map((item, idx) => {
              return (
                <div key={idx} className={this.classNames(`${prefixCls}-step`, {
                  [`w-active`]: this.isActive(item)
                })} style={vertical ? { 'bottom': item + '%' } : { 'left': item + '%' }}>
                </div>
              )
            })
          }
          {marks && marks instanceof Object && this.renderMarks()}
        </div>
      </div>
    )
  }
}

Slider.childContextTypes = {
  component: PropTypes.any
};

Slider.propTypes = {
  prefixCls: PropTypes.string,
  value: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.array,
  ]),
  max: PropTypes.number,
  color: PropTypes.string,
  min: PropTypes.number,
  step: PropTypes.number,
  dots: PropTypes.bool,
  marks: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.bool,
  ]),
  tooltip: PropTypes.bool,
  disabled: PropTypes.bool,
  vertical: PropTypes.bool,
  onChange: PropTypes.func,
}

Slider.defaultProps = {
  prefixCls: 'w-slider',
  value: 0,
  max: 100,
  min: 0,
  step: 1,
  dots: false,
  tooltip: true,
  disabled: false,
  vertical: false,
  onChange() { },
  onDragChange() { }
}

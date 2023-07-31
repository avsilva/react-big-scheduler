import React, { Component } from 'react'
import { PropTypes } from 'prop-types'
import { Col, Row, Spin, Radio, Space, Popover, Calendar, Slider } from 'antd';
import { RightOutlined, LeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DATE_FORMAT } from '.';
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


const CenterCustomHeader = (props) => {

    const { view } = props;

    console.log('CenterCustomHeader', view);
    const marks = {
      0: {
        style: {
          color: '#3D90FF',
        },
        label: view === 0 ? <strong>Day</strong> : 'Day',
      },
      1: {
        style: {
          color: '#3D90FF',
        },
        label: view === 1 ? <strong>Week</strong> : 'Week',
      },
      2: {
        style: {
          color: '#3D90FF',
        },
        label: view === 2 ? <strong>Month</strong> : 'Month',
      }
    }
          
    return (
    <Slider 
      max={2}
      marks={marks} 
      step={null} 
      defaultValue={1} 
      included={false}
      {...props}
      //onChange={this.onsliderChange}
    />
    )
  
  }

class SchedulerHeader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            viewSpinning: false,
            dateSpinning: false,
            visible: false
        }
    }

    static propTypes = {
        onViewChange: PropTypes.func.isRequired,
        goNext: PropTypes.func.isRequired,
        goBack: PropTypes.func.isRequired,
        onSelectDate: PropTypes.func.isRequired,
        schedulerData: PropTypes.object.isRequired,
        leftCustomHeader: PropTypes.object,
        rightCustomHeader: PropTypes.object,
        viewSwitch: PropTypes.string,
    }

    render() {
        const { viewSwitch, leftCustomHeader, rightCustomHeader, goBack, goNext, schedulerData, onViewChange, onSelectDate } = this.props;
        
        const { viewType, showAgenda, isEventPerspective, config } = schedulerData;
        let dateLabel = schedulerData.getDateLabel();
        let selectDate = schedulerData.getSelectedDate();
        let calendarLocale = schedulerData.getCalendarPopoverLocale() !== undefined
            ? schedulerData.getCalendarPopoverLocale().default.Calendar : undefined;
        let defaultValue = `${viewType}${showAgenda ? 1 : 0}${isEventPerspective ? 1 : 0}`;
        let popover = (
            <div className="popover-calendar">
                <Calendar locale={calendarLocale} defaultValue={dayjs(selectDate)} fullscreen={false} onSelect={(date) => {
                    this.handleVisibleChange(false)
                    this.handleEvents(onSelectDate, false, date.format(DATE_FORMAT))
                }} />
            </div>)
            ;

        let radioButtonList = config.views.map(item => {
            return <RadioButton key={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}
                value={`${item.viewType}${item.showAgenda ? 1 : 0}${item.isEventPerspective ? 1 : 0}`}><span
                    style={{ margin: "0px 8px" }}>{item.viewName}</span></RadioButton>
        })
        return (
            <Row gutter={[10,10]} type="flex" align="middle" justify="space-between" style={{ marginBottom: '24px' }}>
                {leftCustomHeader}
                <Col>
                    <div className='header2-text'>
                        <Space>
                            <div>
                                <LeftOutlined type="left" style={{ marginRight: "8px" }} className="icon-nav"
                                    onClick={() => {
                                        this.handleEvents(goBack, false)
                                    }} />
                                {
                                    config.calendarPopoverEnabled
                                        ?
                                        <Popover content={popover} placement="bottomLeft" trigger="click"
                                            open={this.state.visible}
                                            onOpenChange={this.handleVisibleChange}>
                                            <span className={'header2-text-label'} style={{ cursor: 'pointer' }}>{dateLabel}</span>
                                        </Popover>
                                        : <span className={'header2-text-label'}>{dateLabel}</span>
                                }
                                <RightOutlined type="right" style={{ marginLeft: "8px" }} className="icon-nav"
                                    onClick={() => {
                                        this.handleEvents(goNext, false)
                                    }} />
                            </div>
                            <Spin spinning={this.state.dateSpinning} />
                        </Space>
                    </div>
                </Col>
                
                
               
                
                <Col>
                    <Space>
                        <Spin spinning={this.state.viewSpinning} />
                        
                        {
                            viewSwitch === 'slider' ?
                            <div style={{ width: 250 }}>
                            <CenterCustomHeader 
                                view={schedulerData.viewType}
                                onChange={(_val) => {
                                    console.log('_val', _val);
                                    const e = {};
                                    e.target = {};
                                    e.target.value = `${_val}00`
                                    this.handleEvents(onViewChange, true, e)
                                }}
                            />
                            </div>
                            :
                            <RadioGroup
                                buttonStyle="solid"
                                defaultValue={defaultValue}
                                size="default"
                                onChange={(event) => {
                                    console.log('event', event);
                                    this.handleEvents(onViewChange, true, event)
                                }}>
                                {radioButtonList}
                            </RadioGroup>
                        }
                        
                    </Space>
                </Col>
                {rightCustomHeader}
            </Row>
        );
    }

    handleEvents(func, isViewSpinning, funcArg = undefined) {
        const { schedulerData } = this.props
        const { config } = schedulerData

        if (isViewSpinning) {
            if (config.viewChangeSpinEnabled)
                this.setState({ viewSpinning: true })
        }
        else {
            if (config.dateChangeSpinEnabled)
                this.setState({ dateSpinning: true })
        }

        const coreFunc = () => {
            if (funcArg !== undefined)
                func(funcArg);
            else { func() }

            if (isViewSpinning) {
                if (config.viewChangeSpinEnabled)
                    this.setState({ viewSpinning: false })
            }
            else {
                if (config.dateChangeSpinEnabled)
                    this.setState({ dateSpinning: false })
            }
        }

        if (config.viewChangeSpinEnabled || config.dateChangeSpinEnabled)
            setTimeout(() => {
                coreFunc();
            }, config.schedulerHeaderEventsFuncsTimeoutMs); // 100ms
        else { coreFunc(); }
    }

    handleVisibleChange = (visible) => {
        this.setState({ visible });
    }
}

export default SchedulerHeader
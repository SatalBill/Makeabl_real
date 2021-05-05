import React from 'react';
import styled from 'styled-components/native';

function TextComponent({ ...props }) {
    return <Text {...props} >{props.children}</Text>
}

const Text = styled.Text`
    color: ${props => props.color ?? "#000"}

    ${({ xtitle, title, stitle, large, xlarge, medium, xmedium, small }) => {
        switch (true) {
            case xtitle:
                return 'font-size: 52px;'
            case title:
                return 'font-size: 48px;'
            case stitle:
                return 'font-size: 36px;'
            case xlarge:
                return 'font-size: 24px;'
            case large:
                return 'font-size: 20px;'
            case xmedium:
                return 'font-size: 18px;'
            case medium:
                return 'font-size: 16px;'
            case small:
                return 'font-size: 12px;'
            default:
                return 'font-size: 14px;'
        }
    }};

    ${({ light, bold, heavy }) => {
        switch (true) {
            case light:
                return 'font-weight: 200'
            case bold:
                return 'font-weight: 600'
            case heavy:
                return 'font-weight: 700'
            default:
                return 'font-weight: 400'
        }
    }}

    ${({ pa20, pa10, pa5 }) => {
        switch (true) {
            case pa20:
                return 'padding: 20px'
            case pa10:
                return 'padding: 10px'
            case pa5:
                return 'padding: 5px'
            default:
                return 'padding: 0'
        }
    }}

    ${({ center, right }) => {
        switch (true) {
            case center:
                return 'text-align: center'
            case right:
                return 'text-align: right'
            default:
                return 'text-align: left'
        }
    }}

    ${({ railBold, railSemiBold }) => {
        switch (true) {
            case railBold:
                return 'fontFamily: Raleway-Bold'
            case railSemiBold:
                return 'fontFamily: Raleway-SemiBold'
            default:
                return 'fontFamily: Raleway-Medium'
        }
    }}

    ${({ main, text, grey, lightgrey, darkred, redCha, greenCha, darkgrey, white, green, darkblue, purple, menuBar }) => {
        switch (true) {
            case main:
                return 'color: #40DCFD'
            case text:
                return 'color: #495057'
            case grey:
                return 'color: grey'
            case lightgrey:
                return 'color: lightgrey'
            case darkred:
                return 'color: #B2242A'
            case redCha:
                return 'color: #a00'
            case greenCha:
                return 'color: #1B654A'
            case darkgrey:
                return 'color: #A2A9B0'
            case white:
                return 'color: white'
            case green:
                return 'color: #93C100'
            case darkblue:
                return 'color: #031B42'
            case purple:
                return 'color: #556EE6'
            case menuBar:
                return 'color: rgb(23,63,104)'
            default:
                return 'color: black'
        }
    }}
`

export default TextComponent;
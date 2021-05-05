import HelpApi from '../../api/HelpApi';
import { FAQS } from '../type'

export const FAQFunc = (faqs) => ({
  type: FAQS,
  payload: faqs
})

export const FetchFAQ = () => (
  (dispatch) => {
    HelpApi.getFAQ((response) => {
      console.log('actions->response_FAQ', response['data']['faqs_list'])
      dispatch(FAQFunc(response['data']['faqs_list']))
    }, (err) => {
      console.log(err)
    })
  }
)

import Api from '@/services/Api'

export default {
  get_profiles(params) {
    return Api().get('get_profiles/'+params.user_id)
  },
  get_banned(params) {
    return Api().get('get_banned/'+params.user_id)
  },
  get_visitors_likers(params) {
    return Api().get(params.option+'/'+params.user_id)
  },
  add_visit_like_ban(params) {
    return Api().post(params.option, params.data);
  },
  get_like_status(params)
  {
    return Api().post("get_like_status/", params);
  },
  get_ban_status(params)
  {
    return Api().post("get_ban_status/", params);
  },
  get_score(params)
  {
    return Api().post("get_score/", params);
  },
  report_fake(params){
    return Api().post("report_fake/", params.data);
  },
  get_fake_status(params)
  {
    return Api().post("get_fake_status/", params);
  },
  user_exists(params) {
    return Api().get('user_exists/'+params.card_id)
  },
  create_room(params){
    return Api().post('create_room/', params.data);
  },
  store_id(params){
    return Api().post('store_id/', params.data);
  },
  retrieve_history(params){
    return Api().post('retrieve_history/', params.data);
  },
  retrieve_chats(params){
    return Api().post('retrieve_chats/', params.data);
  },
  retrieve_one_chat(params){
    return Api().post('retrieve_one_chat/', params.data);
  },
  action(params)
  {
    return Api().post("action/", params);
  },
  retrieve_notification(params){
    return Api().post('retrieve_notification/', params.data);
  },
  retrieve_notification_chat(params){
    return Api().post('retrieve_notification_chat/', params.data);
  },
  update_notification(params){
    return Api().post('update_notification/', params.data);
  },
  update_notification_chat(params){
    return Api().post('update_notification_chat/', params.data);
  },
}

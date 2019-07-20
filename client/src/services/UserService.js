import Api from '@/services/Api'

export default {
  register(params) {
    return Api().post('register', params)
  },
  get_user_data(params) {
    return Api().post(params.option, params)
  },
  get_user_completion(params) {
    return Api().post('get_user_completion/', params)
  },
  edit_user_data(params) {
    return Api().post(params.option, params.data)
  },
  upload_photos(params) {
    return Api().post('upload_photos', params)
  },
  verify(params) {
    return Api().get('verify/' + params.id)
  },
  login(params) {
    return Api().post('login', params)
  },
  logout(params) {
    return Api().post('logout/', params)
  },
  mailResetPw(params) {
    return Api().post('mailResetPw', params)
  },
  resetPw(params) {
    return Api().post('resetPw', params)
  },
  add_user_tag(params) {
    return Api().post('add_user_tag', params)
  },
  delete_user_tag(params) {
    return Api().post('delete_user_tag', params)
  },
  get_all_tags(params){
    return Api().get(params.option)
  },
  position() {
    return Api().get('position')
  },
  hidden_get_position(){
    return Api().get('http://ip-api.com/json/?fields=country,countryCode,city,zip,lat,lon');
  },
  /** from lat e lng, we obtain address data */
  reverse_geocoding(params){
    return Api().get('https://api.tomtom.com/search/2/reverseGeocode/' + params +'.json?key=S3jdqPiaszFCW4PCh8lfMAIflhGLP90j');
  },
  /**  from city, country ecc. we obtain everything */
  geocoding(params){
    return Api().get('https://api.tomtom.com/search/2/search/' + params + '.json?key=S3jdqPiaszFCW4PCh8lfMAIflhGLP90j');
  },
  store_position(params) {
    return Api().post('store_position', params)
  },
  get_user_id(params) {
    return Api().post('get_user_id', params)
  },
}

const CLIENT_ID = "9ba515c3e7924861a78f09b78f2565a4";
const REDIRECT_URI = "http://localhost:3000/";

let accessToken;

const Spotify = {
  getAccessToken(){
    if (accessToken){
      return accessToken;
    };

    let checkAccessToken = window.location.href.match(/access_token=([^&]*)/);
    let checkExpire = window.location.href.match(/expires_in=([^&]*)/);
    if (window.location.href.match(/access_token=([^&]*)/) != null) {
      accessToken = checkAccessToken[1];
      let expiresIn = Number(checkExpire[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
    }

    if(!accessToken && window.location.href.match(/access_token=([^&]*)/) === null) {
      window.location = 'https://accounts.spotify.com/authorize?client_id='+ CLIENT_ID +'&response_type=token&scope=playlist-modify-public%20user-read-private&redirect_uri='+REDIRECT_URI;
    }
  },

  search: async function (term){

    this.getAccessToken();

    let url = `https://api.spotify.com/v1/search?type=track&q=${term}`;

    try {

        let response = await fetch(
          url,
          {
            method: 'GET',
            headers: {'Authorization': 'Bearer ' + accessToken}
          }
        );
        if (response.ok) {
            let jsonResponse = await response.json();
            if (jsonResponse.tracks) {
              let tracks = jsonResponse.tracks.items.map(track => {
                return {
                  id: track.id,
                  artist: track.artists[0].name, name: track.name, album: track.album.name, uri: track.uri
                }
              });
              return tracks;
            }
            return [];
        }
        throw new Error('Error on retrieving data from Spotify API');
    } catch (error) {
        console.log(error);
    }
  },

  savePlayList: async function (playlistName, tracksURIs){
    if(playlistName === undefined && ! tracksURIs){
      return;
    }

    const userAccessToken = accessToken;
    let varHeaders = {
      'Authorization': 'Bearer ' + userAccessToken,
    };
    let userId;
    let playlistId;

    try {
      let responseUserId =  await fetch(
        'https://api.spotify.com/v1/me',
        {
            headers: varHeaders,
        }
      );

      if(!responseUserId.ok){
        throw new Error('request user ID failed');
      }
      let jsonResponseUserId = await responseUserId.json();
      userId = jsonResponseUserId.id;

      const createPlaylistUrl = `https://api.spotify.com/v1/users/${userId}/playlists`;
      let responsePlaylist = await fetch(
        createPlaylistUrl,
        {
            method: 'POST',
            headers: varHeaders,
            body: JSON.stringify({ name: playlistName })
        },
      );

      if(!responsePlaylist.ok){
        throw new Error('request create playList failed');
      }

      let jsonResponsePlaylist =  await responsePlaylist.json();
      playlistId = jsonResponsePlaylist.id;

      const addTracksUrl = `https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`;

      let responseAddTracks = await fetch(
        addTracksUrl,
        {
            method: 'POST',
            contentType: 'application/json',
            headers: varHeaders,
            body: JSON.stringify({ "uris": tracksURIs })
        },
      );

      if(responseAddTracks.ok){
        throw new Error('request add tracks failed');
      }
      let jsonResponseAddTracks =  await responseAddTracks.json();
      playlistId = jsonResponseAddTracks.id;

    }
    catch (error) {
      console.log(error);
    }
  },
};

export default Spotify;

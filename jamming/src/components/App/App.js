import React, { Component } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist from '../Playlist/Playlist';
import Spotify from  '../../util/Spotify';

import './App.css';

class App extends Component {
  constructor(props){
    super(props);
    this.state = {
      searchResults:[],
      playlistName: "The react Playlist",
      playlistTracks:[]
    };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);

  }

  addTrack(track){
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return ;
    }
    let playlistArray = this.state.playlistTracks
    playlistArray.push(track);

    this.setState({playlistTracks: playlistArray });
  }

  removeTrack(track){

    const trackIndex = this.state.playlistTracks.findIndex(savedTrack => savedTrack.id === track.id) ;

    let playlistArray = this.state.playlistTracks
    playlistArray.splice(trackIndex, 1);

    this.setState({playlistTracks: playlistArray });
  }

  updatePlaylistName(name){
    this.setState({playlistName: name });
  }

  savePlaylist(){
    const trackURIs = this.state.playlistTracks.map(track => track.uri);
    if (trackURIs.length > 0) {
      console.log(trackURIs);
      Spotify.savePlayList(this.state.playlistName, trackURIs).then(results => {
          this.setState({ searchResults: [], playlistName: 'New Playlist', playlistTracks: [] });
      });
    }
  }

  search(term){
    if (term !== '') {
          Spotify.search(term).then(results => {
            if (results){
              this.setState({ searchResults: results })
            }
          });
    } else {
      this.setState({ searchResults: [] })
    }
  }

  render() {
    return (

      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search} />
          <div className="App-playlist">
          <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack} />
          <Playlist
            onSave={this.savePlaylist}
            onNameChange={this.updatePlaylistName}
            onRemove={this.removeTrack}
            playlistName={this.state.playlistName}
            playlistTracks={this.state.playlistTracks}
           />
          </div>
        </div>
      </div>
    );
  }
}

export default App;

const Main = imports.ui.main;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const Clutter = imports.gi.Clutter;
const FileUtils = imports.misc.fileUtils;

const Me = imports.misc.extensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const ANIMATIONS_DATA_PATH = Me.path+'/animations';

const DEBUG = true
const API_VERSION = 1

const BAD_WM_CLASS = [''] //I know it won't work with Chromium and update-manager

const AnimationController = new Lang.Class({
    
    Name: 'AnimationController',
    
    _init : function(){
        
        this.load_animations();
        //this._settings = Convenience.getSettings();
        //this.
    
    },
    
    load_animations : function(){
    
        this.dir = Gio.file_new_for_path( ANIMATIONS_DATA_PATH )
        this.animations = {}
        //this._raw_pool = []
        alog("Pool path:"+this.dir.get_path())
        FileUtils.listDirAsync(this.dir, Lang.bind(this, function(files) {
            // the filename must be xxx.json
            // and the name of animation must match xxx
            for (let i = 0; i < files.length; i++) {
                
                let path = GLib.build_filenamev([this.dir.get_path(), files[i].get_name()])

                let file = Gio.File.new_for_path(path)
                
                let contents, success, tag;
                try {
                    [base_name, ext] = file.get_basename().split('.')
                    
                    assert(ext == 'json', 'not a json file');
                    [success, contents, tag] = file.load_contents(null);
                    let json = JSON.parse(String(contents).replace(/\r|\n|\t/,'')); //truly string resolver
                    assert(base_name == json.Name, 'not a valid animation file');
                    assert(API_VERSION == json['api-version'],
                           "animation ver. %d don\'t match center-api ver. %d".format(json['api-version'], API_VERSION));
                    //this._raw_pool.push(json)
                    
                    this.animations[json.Name] = json;
                    alog('Loaded animation: %s'.format(json.Name) );
                } catch (e) {
                    alog('Failed to load animation file [%s] %s'.format(files[i].get_name(), e));
                }
            }
        }));
    },
    /*
    //TODO:we may need this, well, In the future...
    _make_pre_loader : function (animation){
        let timeline = new Clutter.Timeline(animation["clutter-timeline"]);
        let clutter_animation = animation['clutter-animation'];
        clutter_animation["timeline"] = timeline;
        return (new Clutter.Animation(clutter_animation))
    },
    */
    _get_system_var : function(){
        this.display = global.screen.get_display();
        this.system.width = global.screen_width;
        this.system.height = global.screen_height;
    },
    _connect_wm : function (){
        
        this._signal_ids = {}
        this._signal_ids.created = this.display.connect('window-created', 
                                                            Lang.bind(this, this._window_created));
        this._signal_ids.detroy =  this.display.connect('destroy', 
                                                            Lang.bind(this, this._window_detroy));
    },
    _var_parse : function(string){
        let obj, value;
        try{
            [obj, value] = string.split("__");
        } catch (e) {
        
        }
    }
    _disconnect_wm : function(){
        this.display.disconnect(this._signal_ids.created);
        this.display.disconnect(this._signal_ids.detroy);
    }
    
    
})
function assert(condition, msg){
    if (!condition)
        throw new Error(msg)
}
function alog(msg){
    if (DEBUG)
        log('[Animation][Log]'+msg)
}

function enable() {
    if (typeof Main.wm.animation_center == 'undefined')
        Main.wm.animation_cotroller = new AnimationController()
        
    if (Main.wm.animation_cotroller instanceof AnimationController)
        alog('Enabled at %s'.format((new Date).toLocaleTimeString()) )
}

function disable() {
    if (Main.wm.animation_cotroller instanceof AnimationController)
        Main.wm.animation_center.destroy()
}

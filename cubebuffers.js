CubeFrameBuffers = function(size, opt_depth) {
	this.size = size;
	this.opt_depth = opt_depth;
	//create cubemap texture;
	this.texture = webgl.createTexture();
	webgl.pixelStorei(webgl.UNPACK_FLIP_Y_WEBGL, false);
	webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, this.texture);
	webgl.texParameteri(webgl.TEXTURE_CUBE_MAP, webgl.TEXTURE_MAG_FILTER, webgl.LINEAR);
	webgl.texParameteri(webgl.TEXTURE_CUBE_MAP, webgl.TEXTURE_MIN_FILTER, webgl.LINEAR);
	webgl.texParameteri(webgl.TEXTURE_CUBE_MAP, webgl.TEXTURE_WRAP_S, webgl.CLAMP_TO_EDGE);
	webgl.texParameteri(webgl.TEXTURE_CUBE_MAP, webgl.TEXTURE_WRAP_T, webgl.CLAMP_TO_EDGE);
	// webgl.generateMipmap(webgl.TEXTURE_CUBE_MAP);
	this.face = [
	webgl.TEXTURE_CUBE_MAP_POSITIVE_X, webgl.TEXTURE_CUBE_MAP_NEGATIVE_X, webgl.TEXTURE_CUBE_MAP_POSITIVE_Y, webgl.TEXTURE_CUBE_MAP_NEGATIVE_Y, webgl.TEXTURE_CUBE_MAP_POSITIVE_Z, webgl.TEXTURE_CUBE_MAP_NEGATIVE_Z];

	this.views=[
		{target:[0.5,0,0],up:[0,-1,0]},
		{target:[-0.5,0,0],up:[0,-1,0]},
		{target:[0,0.5,0],up:[0,0,1]},
		{target:[0,-0.5,0],up:[0,0,-1]},
		{target:[0,0,0.5],up:[0,-1,0]},
		{target:[0,0,-0.5],up:[0,-1,0]},

	];
	var type = webgl.getExtension('OES_texture_float') ? webgl.FLOAT : webgl.UNSIGNED_BYTE;
	for (var fi = 0; fi < 6; fi++) {
		webgl.texImage2D(this.face[fi], 0,webgl.RGBA, this.size, this.size, 0,webgl.RGBA, type, null);
	}
	if (this.opt_depth) {
		var db = webgl.createRenderbuffer();
		webgl.bindRenderbuffer(webgl.RENDERBUFFER, db);
		webgl.renderbufferStorage(
		webgl.RENDERBUFFER, webgl.DEPTH_COMPONENT16, this.size, this.size);
	}
	this.framebuffers = [];
	for (var fi = 0; fi < 6; fi++) {
		var fb = webgl.createFramebuffer();
		webgl.bindFramebuffer(webgl.FRAMEBUFFER, fb);
		webgl.framebufferTexture2D(webgl.FRAMEBUFFER,
			webgl.COLOR_ATTACHMENT0,
			this.face[fi],
			this.texture, 
			0);
		if (this.opt_depth) {
			webgl.framebufferRenderbuffer(
			webgl.FRAMEBUFFER, 
			webgl.DEPTH_ATTACHMENT, webgl.RENDERBUFFER, db);
		}
		var status = webgl.checkFramebufferStatus(webgl.FRAMEBUFFER);
		if (status != webgl.FRAMEBUFFER_COMPLETE) {
			throw ("webgl.checkFramebufferStatus() returned " + status);
		}
		this.framebuffers.push(fb);
	}
	webgl.bindFramebuffer(webgl.FRAMEBUFFER,null);
	webgl.bindRenderbuffer(webgl.RENDERBUFFER,null);
	webgl.bindTexture(webgl.TEXTURE_CUBE_MAP, null);
};

CubeFrameBuffers.prototype.bind = function(index) {
	webgl.bindFramebuffer(webgl.FRAMEBUFFER, this.framebuffers[index]);
	webgl.viewport(0, 0, this.size, this.size);
};
CubeFrameBuffers.prototype.unbind = function() {
	webgl.bindFramebuffer(webgl.FRAMEBUFFER, null);
	webgl.viewport(	0, 0, webgl.viewportWidth, webgl.viewportHeight);
}
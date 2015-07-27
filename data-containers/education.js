function Education(name, link, program, major, gpa, dates) {
	this.name = name;
	this.link = link;
	this.program = program;
	this.major = major;
	this.gpa = gpa;
	this.dates = (function (dates) {
		var dd = (~dates.indexOf('(') ? dates.substring(0, dates.indexOf('(')) : dates).split('–'),
			current = dd[1] && ~dd[1].indexOf('Present') ? true : false;

		return {
			start: dd[0] ? new Date(dd[0]).toJSON() : undefined,
			end: dd[1] && !current ? new Date(dd[1]).toJSON() : undefined,
			current: current
		};
	})(dates);
}

module.exports = Education;

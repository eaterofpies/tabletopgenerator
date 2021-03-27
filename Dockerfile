FROM debian
ADD https://raw.githubusercontent.com/jscad/OpenJSCAD.org/V1/packages/web/dist/min.js /tabletopgen/dist/

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 \
    && rm -rf /var/lib/apt/lists/*

COPY src /tabletopgen/
RUN ls -R /tabletopgen
WORKDIR /tabletopgen

ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING='UTF-8'

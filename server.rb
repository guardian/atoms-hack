# Config

def config
  @config ||= begin
    YAML.load_file("config.yml")
  rescue
    {}
  end
end

def api_base_uri
  @api_base_uri ||= (ENV['BASE_URI'] || begin
    port = ENV['PORT']
    uri = "http://localhost"
    uri += ":#{port}" unless port == "80"
    uri
  end) + '/api'
end

# The "database"
redis_uri_string = ENV['REDISTOGO_URL'] || config[:redis_uri] || 'localhost:6379'
redis_uri = URI.parse redis_uri_string
REDIS = Redis.new(:host => redis_uri.host, :port => redis_uri.port, :password => redis_uri.password)


class Atom < ThinModels::Struct

  attribute :id

  # TODO: add created_at, updated_at

  attribute :type

  attribute :title

  attribute :entities

  # Explainers
  attribute :description


  TYPES = %w{explainer map}

end


class Entity < ThinModels::Struct

  attribute :name
  attribute :type

  TYPES = %w{person place}

end


configure do
  enable :cross_origin
end

set :allow_origin, :any
set :protection, :except => [:http_origin]
set :allow_methods, [:get, :post, :put, :delete, :patch, :options]
set :allow_headers, ['*', 'Content-Type', 'Accept', 'AUTHORIZATION', 'Cache-Control', 'X-Requested-With']
set :expose_headers, ['Content-Type']

set :public_folder, 'public'

before '/api*' do
    content_type 'application/vnd.argo+json'
end


get '/' do
  redirect 'index.html'
end

get '/api' do
  {
    :links => [{:rel => 'atoms', :href => "#{api_base_uri}/atoms{?type,entities}"}]
  }.to_json
end

get '/api/atoms' do
  type = params[:type]
  entities = (params[:entities] || '').split(',')

  atom_keys = if ! entities.empty?
                  entities
                      .map {|entity| REDIS.smembers("entities:#{entity}:atoms")}
                      .reduce([]) {|acc, keys| acc + keys}
                      .uniq
              else
                  REDIS.smembers("atoms")
              end

  all_atoms = atom_keys.map do |key|
    if (data = REDIS.get(key))
      hash = JSON.parse(data, :symbolize_names => true)
      Atom.new_skipping_checks hash
    end
  end

  matching_atoms.select! {|r| r.type == type} if type

  {
    :data => all_atoms.map do |r|
      {
        :uri => "#{api_base_uri}/atoms/#{r.id}",
        :data => r
      }
    end
  }.to_json
end

post '/api/atoms' do
  begin
    next_id = REDIS.incr("atoms:max_id")

    body = JSON.parse(request.body.read, :symbolize_names => true)
    # atom_data = body.merge({:status => 'open', :id => next_id})
    atom_data = body[:data].merge({:id => next_id})
    atom = Atom.new(atom_data)

    halt 400 if ! Atom::TYPES.include? atom.type

    atom.entities = (atom.entities || []).map {|entity_data| Entity.new_skipping_checks(entity_data)}

    # FIXME: validate entities

    atom_key = "atoms:#{atom.id}"
    REDIS.set(atom_key, atom.to_json)
    REDIS.sadd("atoms", atom_key)

    atom.entities.each do |entity|
        REDIS.sadd("entities:#{entity.name}:atoms", atom_key)
        REDIS.sadd("entities:#{entity.name}+#{entity.type}:atoms", atom_key)
    end

    {
      :uri => "#{api_base_uri}/atoms/#{atom.id}",
      :data => atom
    }.to_json
  rescue => e
    p e
    halt 400
  end
end

patch '/api/atoms/:id' do
  begin
    id = params[:id].to_i

    atom_data = REDIS.get("atoms:#{id}") or halt 404
    hash = JSON.parse(atom_data, :symbolize_names => true)
    atom = Atom.new_skipping_checks hash

    atom.entities = (atom.entities || []).map {|entity_data| Entity.new_skipping_checks(entity_data)}

    body = JSON.parse(request.body.read, :symbolize_names => true)
    atom_patch = body[:data]

    # FIXME: validate entities

    # if atom_patch.key?(:type)
    if atom_patch.has_key?(:type)
      halt 400 if ! Atom::TYPES.include? atom_patch[:type]
    end

    # FIXME: validate writeable fields
    new_atom = atom.clone
    [:title, :description, :entities].each do |key|
        new_atom[key] = atom_patch[key] if atom_patch.key?(key)
    end

    new_atom.entities = (new_atom.entities || []).map {|entity_data| Entity.new_skipping_checks(entity_data)}

    atom_key = "atoms:#{atom.id}"
    REDIS.set(atom_key, new_atom.to_json)

    atom.entities.each do |entity|
        REDIS.srem("entities:#{entity.name}:atoms", atom_key)
        REDIS.srem("entities:#{entity.name}+#{entity.type}:atoms", atom_key)
    end

    new_atom.entities.each do |entity|
        REDIS.sadd("entities:#{entity.name}:atoms", atom_key)
        REDIS.sadd("entities:#{entity.name}+#{entity.type}:atoms", atom_key)
    end

    nil
  rescue => e
    p e
    halt 400
  end
end


# post '/api/atoms/:id/entities' do
#   begin
#     body = JSON.parse(request.body.read)
#     atom_data = body.merge({'id' => next_id})
#     atom = Atom.new(atom_data)

#     atom_key = "atoms:#{atom.id}"
#     REDIS.set(atom_key, atom.to_json)
#     # REDIS.set("atoms:page_uri:#{atom.page_uri}", atom_key)
#     # REDIS.set("atoms:domain:#{atom.domain}", atom_key)
#     REDIS.sadd("atoms", atom_key)

#     {
#       :uri => "#{api_base_uri}/atoms/#{atom.id}",
#       :data => atom
#     }.to_json
#   rescue => e
#     p e
#     halt 400
#   end
# end



options '*' do
  # for CORS
end
